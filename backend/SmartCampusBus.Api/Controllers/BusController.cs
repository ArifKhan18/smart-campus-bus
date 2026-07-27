using Microsoft.AspNetCore.Mvc;
using SmartCampusBus.Api.Models;
using SmartCampusBus.Api.Services;
using Microsoft.AspNetCore.Authorization;

namespace SmartCampusBus.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")]
public class BusController : ControllerBase
{
    private readonly IBusService _busService;

    public BusController(IBusService busService)
    {
        _busService = busService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllBuses()
    {
        try
        {
            var buses = await _busService.GetAllBusesAsync();
            return Ok(buses);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[BusController] GetAllBuses error: {ex.Message}");
            return StatusCode(500, new { message = "Failed to fetch buses.", detail = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetBus(string id)
    {
        try
        {
            var bus = await _busService.GetBusByIdAsync(id);
            if (bus == null) return NotFound(new { message = "Bus not found" });
            return Ok(bus);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[BusController] GetBus error: {ex.Message}");
            return StatusCode(500, new { message = "Failed to fetch bus.", detail = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateBus([FromBody] Bus request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.BusName) || string.IsNullOrEmpty(request.BusNumber))
            {
                return BadRequest(new { message = "Bus Name and Bus Number are required." });
            }

            var createdBus = await _busService.CreateBusAsync(request);
            return Ok(createdBus);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[BusController] CreateBus error: {ex.Message}");
            return StatusCode(500, new { message = "Failed to create bus.", detail = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBus(string id, [FromBody] Bus request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.BusName) || string.IsNullOrEmpty(request.BusNumber))
            {
                return BadRequest(new { message = "Bus Name and Bus Number are required." });
            }

            var result = await _busService.UpdateBusAsync(id, request);
            if (!result) return NotFound(new { message = "Bus not found" });

            return Ok(new { message = "Bus updated successfully" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[BusController] UpdateBus error: {ex.Message}");
            return StatusCode(500, new { message = "Failed to update bus.", detail = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBus(string id)
    {
        try
        {
            var result = await _busService.DeleteBusAsync(id);
            if (!result) return NotFound(new { message = "Bus not found" });
            return Ok(new { message = "Bus deleted successfully" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[BusController] DeleteBus error: {ex.Message}");
            return StatusCode(500, new { message = "Failed to delete bus.", detail = ex.Message });
        }
    }
}
