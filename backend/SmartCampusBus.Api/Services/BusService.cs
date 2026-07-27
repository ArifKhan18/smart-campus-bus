using Google.Cloud.Firestore;
using SmartCampusBus.Api.Models;

namespace SmartCampusBus.Api.Services;

public interface IBusService
{
    Task<List<Bus>> GetAllBusesAsync();
    Task<Bus?> GetBusByIdAsync(string busId);
    Task<Bus> CreateBusAsync(Bus bus);
    Task<bool> UpdateBusAsync(string busId, Bus bus);
    Task<bool> DeleteBusAsync(string busId);
}

public class BusService : IBusService
{
    private readonly FirestoreDb _firestoreDb;
    private const string BusesCollection = "buses";

    public BusService(FirestoreDb firestoreDb)
    {
        _firestoreDb = firestoreDb;
    }

    public async Task<List<Bus>> GetAllBusesAsync()
    {
        var snapshot = await _firestoreDb.Collection(BusesCollection).GetSnapshotAsync();
        var buses = new List<Bus>();

        foreach (var document in snapshot.Documents)
        {
            buses.Add(MapToBus(document));
        }

        return buses.OrderByDescending(b => b.CreatedAt).ToList();
    }

    public async Task<Bus?> GetBusByIdAsync(string busId)
    {
        var docRef = _firestoreDb.Collection(BusesCollection).Document(busId);
        var snapshot = await docRef.GetSnapshotAsync();

        if (!snapshot.Exists)
        {
            return null;
        }

        return MapToBus(snapshot);
    }

    public async Task<Bus> CreateBusAsync(Bus bus)
    {
        var collectionRef = _firestoreDb.Collection(BusesCollection);
        var docRef = collectionRef.Document(); // Auto-generate ID
        
        bus.BusId = docRef.Id;
        bus.CreatedAt = DateTime.UtcNow;
        bus.UpdatedAt = DateTime.UtcNow;

        var dictionary = MapToDictionary(bus);
        await docRef.SetAsync(dictionary);

        return bus;
    }

    public async Task<bool> UpdateBusAsync(string busId, Bus bus)
    {
        var docRef = _firestoreDb.Collection(BusesCollection).Document(busId);
        var snapshot = await docRef.GetSnapshotAsync();

        if (!snapshot.Exists)
        {
            return false;
        }

        bus.UpdatedAt = DateTime.UtcNow;
        
        var updates = new Dictionary<string, object>
        {
            { "busName", bus.BusName },
            { "busNumber", bus.BusNumber },
            { "capacity", bus.Capacity.HasValue ? bus.Capacity.Value : null! },
            { "assignedDriver", bus.AssignedDriver ?? null! },
            { "assignedDriverName", bus.AssignedDriverName ?? null! },
            { "status", bus.Status },
            { "updatedAt", Timestamp.FromDateTime(bus.UpdatedAt) }
        };

        // Remove null values so Firestore handles them properly or stores them as null
        var cleanUpdates = updates.Where(kvp => kvp.Value != null).ToDictionary(kvp => kvp.Key, kvp => kvp.Value);

        await docRef.UpdateAsync(cleanUpdates);
        return true;
    }

    public async Task<bool> DeleteBusAsync(string busId)
    {
        var docRef = _firestoreDb.Collection(BusesCollection).Document(busId);
        var snapshot = await docRef.GetSnapshotAsync();

        if (!snapshot.Exists)
        {
            return false;
        }

        await docRef.DeleteAsync();
        return true;
    }

    private Bus MapToBus(DocumentSnapshot document)
    {
        var dictionary = document.ToDictionary();
        return new Bus
        {
            BusId = document.Id,
            BusName = dictionary.GetValueOrDefault("busName")?.ToString() ?? string.Empty,
            BusNumber = dictionary.GetValueOrDefault("busNumber")?.ToString() ?? string.Empty,
            Capacity = dictionary.TryGetValue("capacity", out var cap) ? Convert.ToInt32(cap) : null,
            AssignedDriver = dictionary.GetValueOrDefault("assignedDriver")?.ToString(),
            AssignedDriverName = dictionary.GetValueOrDefault("assignedDriverName")?.ToString(),
            Route = dictionary.GetValueOrDefault("route")?.ToString(),
            Status = dictionary.GetValueOrDefault("status")?.ToString() ?? "inactive",
            CreatedAt = dictionary.TryGetValue("createdAt", out var ca) && ca is Timestamp ts ? ts.ToDateTime() : DateTime.MinValue,
            UpdatedAt = dictionary.TryGetValue("updatedAt", out var ua) && ua is Timestamp ts2 ? ts2.ToDateTime() : DateTime.MinValue
        };
    }

    private Dictionary<string, object> MapToDictionary(Bus bus)
    {
        var dict = new Dictionary<string, object>
        {
            { "busId", bus.BusId },
            { "busName", bus.BusName },
            { "busNumber", bus.BusNumber },
            { "status", bus.Status },
            { "createdAt", Timestamp.FromDateTime(DateTime.SpecifyKind(bus.CreatedAt, DateTimeKind.Utc)) },
            { "updatedAt", Timestamp.FromDateTime(DateTime.SpecifyKind(bus.UpdatedAt, DateTimeKind.Utc)) }
        };

        if (bus.Capacity.HasValue) dict.Add("capacity", bus.Capacity.Value);
        if (!string.IsNullOrEmpty(bus.AssignedDriver)) dict.Add("assignedDriver", bus.AssignedDriver);
        if (!string.IsNullOrEmpty(bus.AssignedDriverName)) dict.Add("assignedDriverName", bus.AssignedDriverName);
        if (!string.IsNullOrEmpty(bus.Route)) dict.Add("route", bus.Route);

        return dict;
    }
}
