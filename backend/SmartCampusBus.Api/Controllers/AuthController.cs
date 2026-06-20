using Microsoft.AspNetCore.Mvc;
using SmartCampusBus.Api.Services;

namespace SmartCampusBus.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
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
