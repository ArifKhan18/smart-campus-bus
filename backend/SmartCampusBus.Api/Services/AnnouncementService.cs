using Google.Cloud.Firestore;
using SmartCampusBus.Api.Models;

namespace SmartCampusBus.Api.Services;

public interface IAnnouncementService
{
    Task<Announcement> CreateAnnouncementAsync(Announcement announcement);
    Task<bool> UpdateAnnouncementAsync(string id, Announcement announcement);
    Task<bool> DeleteAnnouncementAsync(string id);
}

public class AnnouncementService : IAnnouncementService
{
    private readonly FirestoreDb _firestoreDb;
    private const string AnnouncementsCollection = "announcements";

    public AnnouncementService(FirestoreDb firestoreDb)
    {
        _firestoreDb = firestoreDb;
    }

    public async Task<Announcement> CreateAnnouncementAsync(Announcement announcement)
    {
        var collectionRef = _firestoreDb.Collection(AnnouncementsCollection);
        var docRef = collectionRef.Document();
        
        announcement.Id = docRef.Id;
        announcement.CreatedAt = DateTime.UtcNow;
        announcement.UpdatedAt = DateTime.UtcNow;

        var dictionary = new Dictionary<string, object>
        {
            { "id", announcement.Id },
            { "title", announcement.Title },
            { "message", announcement.Message },
            { "type", announcement.Type },
            { "priority", announcement.Priority },
            { "targetAudience", announcement.TargetAudience },
            { "status", announcement.Status },
            { "createdAt", Timestamp.FromDateTime(announcement.CreatedAt) },
            { "updatedAt", Timestamp.FromDateTime(announcement.UpdatedAt) }
        };

        await docRef.SetAsync(dictionary);
        return announcement;
    }

    public async Task<bool> UpdateAnnouncementAsync(string id, Announcement announcement)
    {
        var docRef = _firestoreDb.Collection(AnnouncementsCollection).Document(id);
        var snapshot = await docRef.GetSnapshotAsync();

        if (!snapshot.Exists) return false;

        announcement.UpdatedAt = DateTime.UtcNow;
        
        var updates = new Dictionary<string, object>
        {
            { "title", announcement.Title },
            { "message", announcement.Message },
            { "type", announcement.Type },
            { "priority", announcement.Priority },
            { "targetAudience", announcement.TargetAudience },
            { "status", announcement.Status },
            { "updatedAt", Timestamp.FromDateTime(announcement.UpdatedAt) }
        };

        var cleanUpdates = updates.Where(kvp => kvp.Value != null).ToDictionary(kvp => kvp.Key, kvp => kvp.Value);
        await docRef.UpdateAsync(cleanUpdates);
        return true;
    }

    public async Task<bool> DeleteAnnouncementAsync(string id)
    {
        var docRef = _firestoreDb.Collection(AnnouncementsCollection).Document(id);
        var snapshot = await docRef.GetSnapshotAsync();

        if (!snapshot.Exists) return false;

        await docRef.DeleteAsync();
        return true;
    }
}
