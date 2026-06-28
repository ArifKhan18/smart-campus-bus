namespace SmartCampusBus.Api.Models;

public class RouteStop
{
    public string Name { get; set; } = string.Empty;
    public int Order { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}
