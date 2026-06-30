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
        
        return new User
        {
            Uid = dictionary.GetValueOrDefault("uid")?.ToString() ?? string.Empty,
            Name = dictionary.GetValueOrDefault("name")?.ToString() ?? string.Empty,
            Email = dictionary.GetValueOrDefault("email")?.ToString() ?? string.Empty,
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
}
