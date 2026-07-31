using Microsoft.AspNetCore.Mvc;
using SmartCampusBus.Api.Models;
using SmartCampusBus.Api.Services;

using Microsoft.AspNetCore.Authorization;

namespace SmartCampusBus.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")]
public class ScheduleController : ControllerBase
{
    private readonly IScheduleService _scheduleService;

    public ScheduleController(IScheduleService scheduleService)
    {
        _scheduleService = scheduleService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllSchedules()
    {
        try
        {
            var schedules = await _scheduleService.GetAllSchedulesAsync();
            return Ok(schedules);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Server error: {ex.Message}" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSchedule(string id)
    {
        try
        {
            var schedule = await _scheduleService.GetScheduleByIdAsync(id);
            
            if (schedule == null)
            {
                return NotFound(new { message = "Schedule not found" });
            }

            return Ok(schedule);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Server error: {ex.Message}" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateSchedule([FromBody] Schedule request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.BusId) || string.IsNullOrEmpty(request.DepartureTime))
            {
                return BadRequest(new { message = "Bus and Departure Time are required." });
            }

            var createdSchedule = await _scheduleService.CreateScheduleAsync(request);
            return CreatedAtAction(nameof(GetSchedule), new { id = createdSchedule.ScheduleId }, createdSchedule);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Server error: {ex.Message}" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSchedule(string id, [FromBody] Schedule request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.BusId) || string.IsNullOrEmpty(request.DepartureTime))
            {
                return BadRequest(new { message = "Bus and Departure Time are required." });
            }

            var result = await _scheduleService.UpdateScheduleAsync(id, request);
            
            if (!result)
            {
                return NotFound(new { message = "Schedule not found" });
            }

            return Ok(new { message = "Schedule updated successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Server error: {ex.Message}" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSchedule(string id)
    {
        try
        {
            var result = await _scheduleService.DeleteScheduleAsync(id);
            
            if (!result)
            {
                return NotFound(new { message = "Schedule not found" });
            }

            return Ok(new { message = "Schedule deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Server error: {ex.Message}" });
        }
    }
}
