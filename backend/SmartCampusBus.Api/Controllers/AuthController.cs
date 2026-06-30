using Microsoft.AspNetCore.Mvc;
using SmartCampusBus.Api.Services;

using Microsoft.AspNetCore.Authorization;

namespace SmartCampusBus.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpGet("user/{uid}")]
    public async Task<IActionResult> GetUser(string uid)
    {
        var user = await _authService.GetUserAsync(uid);
        
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        return Ok(user);
    }

    [HttpGet("users/role/{role}")]
    public async Task<IActionResult> GetUsersByRole(string role, [FromQuery] string? status = null)
    {
        var users = await _authService.GetUsersByRoleAsync(role, status);
        return Ok(users);
    }

    // This endpoint will be primarily used by Admins in Phase 3
    [HttpPut("user/{uid}/status")]
    public async Task<IActionResult> UpdateUserStatus(string uid, [FromBody] UpdateStatusDto request)
    {
        if (string.IsNullOrEmpty(request.Status) || 
            (request.Status != "active" && request.Status != "pending" && request.Status != "rejected"))
        {
            return BadRequest(new { message = "Invalid status" });
        }

        var result = await _authService.UpdateUserStatusAsync(uid, request.Status);
        
        if (!result)
        {
            return NotFound(new { message = "User not found" });
        }

        return Ok(new { message = $"User status updated to {request.Status}" });
    }
}

public class UpdateStatusDto
{
    public string Status { get; set; } = string.Empty;
}
