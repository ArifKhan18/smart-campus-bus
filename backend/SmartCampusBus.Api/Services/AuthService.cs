using Google.Cloud.Firestore;
using SmartCampusBus.Api.Models;

namespace SmartCampusBus.Api.Services;

public interface IAuthService
{
    Task<User?> GetUserAsync(string uid);
    Task<bool> UpdateUserStatusAsync(string uid, string status);
    Task<List<User>> GetUsersByRoleAsync(string role, string? statusFilter = null);
    Task SaveOtpAsync(string uid, string otpCode, DateTime expiresAt);
    Task<bool> VerifyOtpAsync(string uid, string otpCode);
    Task<bool> CheckUsernameExistsAsync(string username);
    Task<bool> UpdateProfileAsync(string uid, string username, string name);
    Task<bool> DeleteUserAccountAsync(string uid);
}

public class AuthService : IAuthService
{
    private readonly FirestoreDb _firestoreDb;
    private const string UsersCollection = "users";

    public AuthService(FirestoreDb firestoreDb)
    {
        _firestoreDb = firestoreDb;
    }

    public async Task<User?> GetUserAsync(string uid)
    {
        var docRef = _firestoreDb.Collection(UsersCollection).Document(uid);
        var snapshot = await docRef.GetSnapshotAsync();

        if (!snapshot.Exists)
        {
            return null;
        }

        var dictionary = snapshot.ToDictionary();
        var email = dictionary.GetValueOrDefault("email")?.ToString() ?? string.Empty;
        var username = dictionary.GetValueOrDefault("username")?.ToString();
        var usernameChangeCount = Convert.ToInt32(dictionary.GetValueOrDefault("usernameChangeCount") ?? 0);

        // Auto-generate username for existing users
        if (string.IsNullOrEmpty(username))
        {
            var prefix = email.Split('@').FirstOrDefault() ?? "user";
            username = $"{prefix}{new Random().Next(1000, 9999)}";
            await docRef.UpdateAsync(new Dictionary<string, object> 
            { 
                { "username", username }, 
                { "usernameChangeCount", 0 } 
            });
        }
        
        return new User
        {
            Uid = dictionary.GetValueOrDefault("uid")?.ToString() ?? string.Empty,
            Name = dictionary.GetValueOrDefault("name")?.ToString() ?? string.Empty,
            Email = email,
            Username = username,
            UsernameChangeCount = usernameChangeCount,
            Role = dictionary.GetValueOrDefault("role")?.ToString() ?? string.Empty,
            Status = dictionary.GetValueOrDefault("status")?.ToString() ?? "active",
            AssignedBus = dictionary.GetValueOrDefault("assignedBus")?.ToString(),
            CreatedAt = dictionary.TryGetValue("createdAt", out var ca) && ca is Timestamp ts ? ts.ToDateTime() : DateTime.MinValue
        };
    }

    public async Task<bool> UpdateUserStatusAsync(string uid, string status)
    {
        var docRef = _firestoreDb.Collection(UsersCollection).Document(uid);
        var snapshot = await docRef.GetSnapshotAsync();

        if (!snapshot.Exists)
        {
            return false;
        }

        var updates = new Dictionary<string, object>
        {
            { "status", status }
        };

        await docRef.UpdateAsync(updates);
        return true;
    }

    public async Task<List<User>> GetUsersByRoleAsync(string role, string? statusFilter = null)
    {
        var usersCollection = _firestoreDb.Collection(UsersCollection);
        Query query = usersCollection.WhereEqualTo("role", role);

        if (!string.IsNullOrEmpty(statusFilter))
        {
            query = query.WhereEqualTo("status", statusFilter);
        }

        var snapshot = await query.GetSnapshotAsync();
        var users = new List<User>();

        foreach (var document in snapshot.Documents)
        {
            var dictionary = document.ToDictionary();
            users.Add(new User
            {
                Uid = dictionary.GetValueOrDefault("uid")?.ToString() ?? string.Empty,
                Name = dictionary.GetValueOrDefault("name")?.ToString() ?? string.Empty,
                Email = dictionary.GetValueOrDefault("email")?.ToString() ?? string.Empty,
                Username = dictionary.GetValueOrDefault("username")?.ToString() ?? string.Empty,
                UsernameChangeCount = Convert.ToInt32(dictionary.GetValueOrDefault("usernameChangeCount") ?? 0),
                Role = dictionary.GetValueOrDefault("role")?.ToString() ?? string.Empty,
                Status = dictionary.GetValueOrDefault("status")?.ToString() ?? "active",
                AssignedBus = dictionary.GetValueOrDefault("assignedBus")?.ToString(),
                CreatedAt = dictionary.TryGetValue("createdAt", out var ca) && ca is Timestamp ts ? ts.ToDateTime() : DateTime.MinValue
            });
        }

        return users.OrderByDescending(u => u.CreatedAt).ToList();
    }

    public async Task SaveOtpAsync(string uid, string otpCode, DateTime expiresAt)
    {
        var docRef = _firestoreDb.Collection(UsersCollection).Document(uid);
        var snapshot = await docRef.GetSnapshotAsync();
        if (!snapshot.Exists) return;

        var updates = new Dictionary<string, object>
        {
            { "otpCode", otpCode },
            { "otpExpiresAt", Timestamp.FromDateTime(DateTime.SpecifyKind(expiresAt, DateTimeKind.Utc)) }
        };

        await docRef.UpdateAsync(updates);
    }

    public async Task<bool> VerifyOtpAsync(string uid, string otpCode)
    {
        var docRef = _firestoreDb.Collection(UsersCollection).Document(uid);
        var snapshot = await docRef.GetSnapshotAsync();
        
        if (!snapshot.Exists) return false;

        var dict = snapshot.ToDictionary();
        var storedCode = dict.GetValueOrDefault("otpCode")?.ToString();
        var expiresAtTs = dict.GetValueOrDefault("otpExpiresAt") as Timestamp?;

        if (string.IsNullOrEmpty(storedCode) || storedCode != otpCode || expiresAtTs == null)
        {
            return false;
        }

        if (expiresAtTs.Value.ToDateTime() < DateTime.UtcNow)
        {
            return false; // Expired
        }

        // OTP is valid. Clear it and update Firebase Auth
        var updates = new Dictionary<string, object>
        {
            { "otpCode", FieldValue.Delete },
            { "otpExpiresAt", FieldValue.Delete },
            { "isEmailVerified", true }
        };
        await docRef.UpdateAsync(updates);

        // Update Firebase Auth directly
        try
        {
            var userArgs = new FirebaseAdmin.Auth.UserRecordArgs
            {
                Uid = uid,
                EmailVerified = true
            };
            await FirebaseAdmin.Auth.FirebaseAuth.DefaultInstance.UpdateUserAsync(userArgs);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error updating Firebase Auth: {ex.Message}");
        }

        return true;
    }

    public async Task<bool> CheckUsernameExistsAsync(string username)
    {
        var usersCollection = _firestoreDb.Collection(UsersCollection);
        var query = usersCollection.WhereEqualTo("username", username);
        var snapshot = await query.GetSnapshotAsync();
        return snapshot.Documents.Count > 0;
    }

    public async Task<bool> UpdateProfileAsync(string uid, string username, string name)
    {
        var docRef = _firestoreDb.Collection(UsersCollection).Document(uid);
        var snapshot = await docRef.GetSnapshotAsync();
        
        if (!snapshot.Exists) return false;

        var dict = snapshot.ToDictionary();
        var currentUsername = dict.GetValueOrDefault("username")?.ToString();
        var usernameChangeCount = Convert.ToInt32(dict.GetValueOrDefault("usernameChangeCount") ?? 0);

        var updates = new Dictionary<string, object>
        {
            { "name", name }
        };

        if (!string.Equals(currentUsername, username, StringComparison.OrdinalIgnoreCase))
        {
            updates.Add("username", username);
        }

        await docRef.UpdateAsync(updates);
        return true;
    }

    public async Task<bool> DeleteUserAccountAsync(string uid)
    {
        // Delete from Firestore
        var docRef = _firestoreDb.Collection(UsersCollection).Document(uid);
        await docRef.DeleteAsync();

        // Delete from Firebase Auth
        try
        {
            await FirebaseAdmin.Auth.FirebaseAuth.DefaultInstance.DeleteUserAsync(uid);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error deleting Firebase Auth user: {ex.Message}");
            return false;
        }

        return true;
    }
}
