namespace SmartCampusBus.Api.Models;

public class User
{
    public string Uid { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? AdminLevel { get; set; }
    public string Status { get; set; } = "active";
    public string? AssignedBus { get; set; }
    public DateTime CreatedAt { get; set; }
}
