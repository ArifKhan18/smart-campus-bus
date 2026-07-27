using Google.Cloud.Firestore;
using SmartCampusBus.Api.Models;

namespace SmartCampusBus.Api.Services;

public interface IScheduleService
{
    Task<List<Schedule>> GetAllSchedulesAsync();
    Task<Schedule?> GetScheduleByIdAsync(string id);
    Task<Schedule> CreateScheduleAsync(Schedule schedule);
    Task<bool> UpdateScheduleAsync(string id, Schedule schedule);
    Task<bool> DeleteScheduleAsync(string id);
}

public class ScheduleService : IScheduleService
{
    private readonly FirestoreDb _firestoreDb;
    private const string SchedulesCollection = "schedules";

    public ScheduleService(FirestoreDb firestoreDb)
    {
        _firestoreDb = firestoreDb;
    }

    public async Task<List<Schedule>> GetAllSchedulesAsync()
    {
        var snapshot = await _firestoreDb.Collection(SchedulesCollection).GetSnapshotAsync();
        var schedules = new List<Schedule>();

        foreach (var document in snapshot.Documents)
        {
            schedules.Add(MapToSchedule(document));
        }

        return schedules.OrderBy(s => s.DepartureTime).ToList();
    }

    public async Task<Schedule?> GetScheduleByIdAsync(string id)
    {
        var docRef = _firestoreDb.Collection(SchedulesCollection).Document(id);
        var snapshot = await docRef.GetSnapshotAsync();

        if (!snapshot.Exists)
        {
            return null;
        }

        return MapToSchedule(snapshot);
    }

    public async Task<Schedule> CreateScheduleAsync(Schedule schedule)
    {
        var collectionRef = _firestoreDb.Collection(SchedulesCollection);
        var docRef = collectionRef.Document();
        
        schedule.ScheduleId = docRef.Id;
        schedule.CreatedAt = DateTime.UtcNow;
        schedule.UpdatedAt = DateTime.UtcNow;

        var dictionary = MapToDictionary(schedule);
        await docRef.SetAsync(dictionary);

        return schedule;
    }

    public async Task<bool> UpdateScheduleAsync(string id, Schedule schedule)
    {
        var docRef = _firestoreDb.Collection(SchedulesCollection).Document(id);
        var snapshot = await docRef.GetSnapshotAsync();

        if (!snapshot.Exists)
        {
            return false;
        }

        schedule.UpdatedAt = DateTime.UtcNow;
        
        var updates = new Dictionary<string, object>
        {
            { "busId", schedule.BusId },
            { "busName", schedule.BusName },
            { "departureTime", schedule.DepartureTime },
            { "operatingDays", schedule.OperatingDays ?? new List<string>() },
            { "updatedAt", Timestamp.FromDateTime(schedule.UpdatedAt) }
        };

        await docRef.UpdateAsync(updates);
        return true;
    }

    public async Task<bool> DeleteScheduleAsync(string id)
    {
        var docRef = _firestoreDb.Collection(SchedulesCollection).Document(id);
        var snapshot = await docRef.GetSnapshotAsync();

        if (!snapshot.Exists)
        {
            return false;
        }

        await docRef.DeleteAsync();
        return true;
    }

    private Schedule MapToSchedule(DocumentSnapshot document)
    {
        var dictionary = document.ToDictionary();
        var schedule = new Schedule
        {
            ScheduleId = document.Id,
            BusId = dictionary.GetValueOrDefault("busId")?.ToString() ?? string.Empty,
            BusName = dictionary.GetValueOrDefault("busName")?.ToString() ?? string.Empty,
            DepartureTime = dictionary.GetValueOrDefault("departureTime")?.ToString() ?? string.Empty,
            CreatedAt = dictionary.TryGetValue("createdAt", out var ca) && ca is Timestamp ts ? ts.ToDateTime() : DateTime.MinValue,
            UpdatedAt = dictionary.TryGetValue("updatedAt", out var ua) && ua is Timestamp ts2 ? ts2.ToDateTime() : DateTime.MinValue
        };

        if (dictionary.TryGetValue("operatingDays", out var daysObj) && daysObj is List<object> daysList)
        {
            foreach (var day in daysList)
            {
                schedule.OperatingDays.Add(day.ToString() ?? "");
            }
        }

        return schedule;
    }

    private Dictionary<string, object> MapToDictionary(Schedule schedule)
    {
        var dict = new Dictionary<string, object>
        {
            { "scheduleId", schedule.ScheduleId },
            { "busId", schedule.BusId },
            { "busName", schedule.BusName },
            { "departureTime", schedule.DepartureTime },
            { "operatingDays", schedule.OperatingDays ?? new List<string>() },
            { "createdAt", Timestamp.FromDateTime(DateTime.SpecifyKind(schedule.CreatedAt, DateTimeKind.Utc)) },
            { "updatedAt", Timestamp.FromDateTime(DateTime.SpecifyKind(schedule.UpdatedAt, DateTimeKind.Utc)) }
        };

        return dict;
    }
}
