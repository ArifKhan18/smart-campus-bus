namespace SmartCampusBus.Api.Models;

public class Bus
{
    public string BusId { get; set; } = string.Empty;
    public string BusName { get; set; } = string.Empty;
    public string BusNumber { get; set; } = string.Empty;
    public int? Capacity { get; set; } // Optional
    public string? AssignedDriver { get; set; } // Driver's UID
    public string? AssignedDriverName { get; set; }
    public string? Route { get; set; }
    public string Status { get; set; } = "inactive"; // active, inactive, maintenance, special_trip
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
