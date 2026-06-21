namespace SmartCampusBus.Api.Models;

public class Route
{
    public string RouteId { get; set; } = string.Empty;
    public string RouteName { get; set; } = string.Empty;
    public string StartPoint { get; set; } = string.Empty;
    public string EndPoint { get; set; } = string.Empty;
    public List<RouteStop> Stops { get; set; } = new List<RouteStop>();
    public string? AssignedBus { get; set; } // Bus ID
    public string? AssignedBusName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
