namespace SmartCampusBus.Api.Models;

public class Schedule
{
    public string ScheduleId { get; set; } = string.Empty;
    public string BusId { get; set; } = string.Empty;
    public string BusName { get; set; } = string.Empty;
    public string DepartureTime { get; set; } = string.Empty;
    public List<string> OperatingDays { get; set; } = new List<string>();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
