using Microsoft.AspNetCore.Mvc;
using SmartCampusBus.Api.Models;
using SmartCampusBus.Api.Services;

namespace SmartCampusBus.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
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
        var schedules = await _scheduleService.GetAllSchedulesAsync();
        return Ok(schedules);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSchedule(string id)
    {
        var schedule = await _scheduleService.GetScheduleByIdAsync(id);
        
        if (schedule == null)
        {
            return NotFound(new { message = "Schedule not found" });
        }

        return Ok(schedule);
    }

    [HttpPost]
    public async Task<IActionResult> CreateSchedule([FromBody] Schedule request)
    {
        if (string.IsNullOrEmpty(request.BusId) || string.IsNullOrEmpty(request.DepartureTime))
        {
            return BadRequest(new { message = "Bus and Departure Time are required." });
        }

        var createdSchedule = await _scheduleService.CreateScheduleAsync(request);
        return CreatedAtAction(nameof(GetSchedule), new { id = createdSchedule.ScheduleId }, createdSchedule);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSchedule(string id, [FromBody] Schedule request)
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

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSchedule(string id)
    {
        var result = await _scheduleService.DeleteScheduleAsync(id);
        
        if (!result)
        {
            return NotFound(new { message = "Schedule not found" });
        }

        return Ok(new { message = "Schedule deleted successfully" });
    }
}
