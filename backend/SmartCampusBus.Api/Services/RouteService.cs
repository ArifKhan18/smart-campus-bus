using Google.Cloud.Firestore;
using SmartCampusBus.Api.Models;
using System.Text.Json;

namespace SmartCampusBus.Api.Services;

public interface IRouteService
{
    Task<List<Models.Route>> GetAllRoutesAsync();
    Task<Models.Route?> GetRouteByIdAsync(string routeId);
    Task<Models.Route> CreateRouteAsync(Models.Route route);
    Task<bool> UpdateRouteAsync(string routeId, Models.Route route);
    Task<bool> DeleteRouteAsync(string routeId);
}

public class RouteService : IRouteService
{
    private readonly FirestoreDb _firestoreDb;
    private const string RoutesCollection = "routes";

    public RouteService(FirestoreDb firestoreDb)
    {
        _firestoreDb = firestoreDb;
    }

    public async Task<List<Models.Route>> GetAllRoutesAsync()
    {
        var snapshot = await _firestoreDb.Collection(RoutesCollection).GetSnapshotAsync();
        var routes = new List<Models.Route>();

        foreach (var document in snapshot.Documents)
        {
            routes.Add(MapToRoute(document));
        }

        return routes.OrderByDescending(r => r.CreatedAt).ToList();
    }

    public async Task<Models.Route?> GetRouteByIdAsync(string routeId)
    {
        var docRef = _firestoreDb.Collection(RoutesCollection).Document(routeId);
        var snapshot = await docRef.GetSnapshotAsync();

        if (!snapshot.Exists)
        {
            return null;
        }

        return MapToRoute(snapshot);
    }

    public async Task<Models.Route> CreateRouteAsync(Models.Route route)
    {
        var collectionRef = _firestoreDb.Collection(RoutesCollection);
        var docRef = collectionRef.Document();
        
        route.RouteId = docRef.Id;
        route.CreatedAt = DateTime.UtcNow;
        route.UpdatedAt = DateTime.UtcNow;

        var dictionary = MapToDictionary(route);
        await docRef.SetAsync(dictionary);

        return route;
    }

    public async Task<bool> UpdateRouteAsync(string routeId, Models.Route route)
    {
        var docRef = _firestoreDb.Collection(RoutesCollection).Document(routeId);
        var snapshot = await docRef.GetSnapshotAsync();

        if (!snapshot.Exists)
        {
            return false;
        }

        route.UpdatedAt = DateTime.UtcNow;
        
        var updates = new Dictionary<string, object>
        {
            { "routeName", route.RouteName },
            { "startPoint", route.StartPoint },
            { "endPoint", route.EndPoint },
            { "assignedBus", route.AssignedBus ?? null! },
            { "assignedBusName", route.AssignedBusName ?? null! },
            { "updatedAt", Timestamp.FromDateTime(route.UpdatedAt) }
        };

        if (route.Stops != null && route.Stops.Any())
        {
            var stopsList = route.Stops.Select(s => new Dictionary<string, object>
            {
                { "name", s.Name },
                { "order", s.Order }
            }).ToList();
            
            updates.Add("stops", stopsList);
        }
        else
        {
            updates.Add("stops", new List<object>());
        }

        var cleanUpdates = updates.Where(kvp => kvp.Value != null).ToDictionary(kvp => kvp.Key, kvp => kvp.Value);

        await docRef.UpdateAsync(cleanUpdates);
        return true;
    }

    public async Task<bool> DeleteRouteAsync(string routeId)
    {
        var docRef = _firestoreDb.Collection(RoutesCollection).Document(routeId);
        var snapshot = await docRef.GetSnapshotAsync();

        if (!snapshot.Exists)
        {
            return false;
        }

        await docRef.DeleteAsync();
        return true;
    }

    private Models.Route MapToRoute(DocumentSnapshot document)
    {
        var dictionary = document.ToDictionary();
        var route = new Models.Route
        {
            RouteId = document.Id,
            RouteName = dictionary.GetValueOrDefault("routeName")?.ToString() ?? string.Empty,
            StartPoint = dictionary.GetValueOrDefault("startPoint")?.ToString() ?? string.Empty,
            EndPoint = dictionary.GetValueOrDefault("endPoint")?.ToString() ?? string.Empty,
            AssignedBus = dictionary.GetValueOrDefault("assignedBus")?.ToString(),
            AssignedBusName = dictionary.GetValueOrDefault("assignedBusName")?.ToString(),
            CreatedAt = dictionary.TryGetValue("createdAt", out var ca) && ca is Timestamp ts ? ts.ToDateTime() : DateTime.MinValue,
            UpdatedAt = dictionary.TryGetValue("updatedAt", out var ua) && ua is Timestamp ts2 ? ts2.ToDateTime() : DateTime.MinValue
        };

        if (dictionary.TryGetValue("stops", out var stopsObj) && stopsObj is List<object> stopsList)
        {
            foreach (var stopObj in stopsList)
            {
                if (stopObj is Dictionary<string, object> stopDict)
                {
                    route.Stops.Add(new RouteStop
                    {
                        Name = stopDict.GetValueOrDefault("name")?.ToString() ?? string.Empty,
                        Order = stopDict.TryGetValue("order", out var order) ? Convert.ToInt32(order) : 0
                    });
                }
            }
        }

        return route;
    }

    private Dictionary<string, object> MapToDictionary(Models.Route route)
    {
        var dict = new Dictionary<string, object>
        {
            { "routeId", route.RouteId },
            { "routeName", route.RouteName },
            { "startPoint", route.StartPoint },
            { "endPoint", route.EndPoint },
            { "createdAt", Timestamp.FromDateTime(DateTime.SpecifyKind(route.CreatedAt, DateTimeKind.Utc)) },
            { "updatedAt", Timestamp.FromDateTime(DateTime.SpecifyKind(route.UpdatedAt, DateTimeKind.Utc)) }
        };

        if (!string.IsNullOrEmpty(route.AssignedBus)) dict.Add("assignedBus", route.AssignedBus);
        if (!string.IsNullOrEmpty(route.AssignedBusName)) dict.Add("assignedBusName", route.AssignedBusName);

        var stopsList = new List<Dictionary<string, object>>();
        if (route.Stops != null)
        {
            foreach (var stop in route.Stops)
            {
                stopsList.Add(new Dictionary<string, object>
                {
                    { "name", stop.Name },
                    { "order", stop.Order }
                });
            }
        }
        dict.Add("stops", stopsList);

        return dict;
    }
}
