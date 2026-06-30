using Microsoft.AspNetCore.Mvc;
using SmartCampusBus.Api.Services;

using Microsoft.AspNetCore.Authorization;

namespace SmartCampusBus.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IEmailService _emailService;

    public AuthController(IAuthService authService, IEmailService emailService)
    {
        _authService = authService;
        _emailService = emailService;
    }

    [HttpGet("user/{uid}")]
    [Authorize(Roles = "admin")]
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
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetUsersByRole(string role, [FromQuery] string? status = null)
    {
        var users = await _authService.GetUsersByRoleAsync(role, status);
        return Ok(users);
    }

    // This endpoint will be primarily used by Admins in Phase 3
    [HttpPut("user/{uid}/status")]
    [Authorize(Roles = "admin")]
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

    [HttpPost("send-otp")]
    [Authorize]
    public async Task<IActionResult> SendOtp()
    {
        try
        {
            var uid = User.FindFirst("user_id")?.Value;
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var user = await _authService.GetUserAsync(uid);
            if (user == null) return NotFound(new { message = "User not found" });

            var random = new Random();
            var otpCode = random.Next(100000, 999999).ToString();
            var expiresAt = DateTime.UtcNow.AddMinutes(10);

            await _authService.SaveOtpAsync(uid, otpCode, expiresAt);
            await _emailService.SendOtpEmailAsync(user.Email, otpCode, user.Name);

            return Ok(new { message = "OTP sent successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Server Error: {ex.Message}" });
        }
    }

    [HttpPost("verify-otp")]
    [Authorize]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto request)
    {
        var uid = User.FindFirst("user_id")?.Value;
        if (string.IsNullOrEmpty(uid)) return Unauthorized();

        var isValid = await _authService.VerifyOtpAsync(uid, request.Code);
        if (!isValid)
        {
            return BadRequest(new { message = "Invalid or expired OTP." });
        }

        return Ok(new { message = "Email verified successfully." });
    }
}

public class VerifyOtpDto
{
    public string Code { get; set; } = string.Empty;
}

public class UpdateStatusDto
{
    public string Status { get; set; } = string.Empty;
}
