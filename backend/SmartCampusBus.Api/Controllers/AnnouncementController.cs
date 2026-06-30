using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using SmartCampusBus.Api.Services;
using SmartCampusBus.Api.Models;

namespace SmartCampusBus.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")]
public class AnnouncementController : ControllerBase
{
    private readonly IAnnouncementService _announcementService;

    public AnnouncementController(IAnnouncementService announcementService)
    {
        _announcementService = announcementService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateAnnouncement([FromBody] Announcement request)
    {
        if (string.IsNullOrEmpty(request.Title) || string.IsNullOrEmpty(request.Message))
        {
            return BadRequest(new { message = "Title and Message are required." });
        }

        var created = await _announcementService.CreateAnnouncementAsync(request);
        return Ok(created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAnnouncement(string id, [FromBody] Announcement request)
    {
        if (string.IsNullOrEmpty(request.Title) || string.IsNullOrEmpty(request.Message))
        {
            return BadRequest(new { message = "Title and Message are required." });
        }

        var result = await _announcementService.UpdateAnnouncementAsync(id, request);
        
        if (!result) return NotFound(new { message = "Announcement not found" });

        return Ok(new { message = "Announcement updated successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAnnouncement(string id)
    {
        var result = await _announcementService.DeleteAnnouncementAsync(id);
        
        if (!result) return NotFound(new { message = "Announcement not found" });

        return Ok(new { message = "Announcement deleted successfully" });
    }
}
