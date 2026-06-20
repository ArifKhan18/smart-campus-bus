using Google.Cloud.Firestore;
using SmartCampusBus.Api.Models;

namespace SmartCampusBus.Api.Services;

public interface IAuthService
{
    Task<User?> GetUserAsync(string uid);
    Task<bool> UpdateUserStatusAsync(string uid, string status);
    Task<List<User>> GetUsersByRoleAsync(string role, string? statusFilter = null);
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
}
