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
        var buses = await _busService.GetAllBusesAsync();
        return Ok(buses);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetBus(string id)
    {
        var bus = await _busService.GetBusByIdAsync(id);
        
        if (bus == null)
        {
            return NotFound(new { message = "Bus not found" });
        }

        return Ok(bus);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBus([FromBody] Bus request)
    {
        if (string.IsNullOrEmpty(request.BusName) || string.IsNullOrEmpty(request.BusNumber))
        {
            return BadRequest(new { message = "Bus Name and Bus Number are required." });
        }

        var createdBus = await _busService.CreateBusAsync(request);
        return CreatedAtAction(nameof(GetBus), new { id = createdBus.BusId }, createdBus);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBus(string id, [FromBody] Bus request)
    {
        if (string.IsNullOrEmpty(request.BusName) || string.IsNullOrEmpty(request.BusNumber))
        {
            return BadRequest(new { message = "Bus Name and Bus Number are required." });
        }

        var result = await _busService.UpdateBusAsync(id, request);
        
        if (!result)
        {
            return NotFound(new { message = "Bus not found" });
        }

        return Ok(new { message = "Bus updated successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBus(string id)
    {
        var result = await _busService.DeleteBusAsync(id);
        
        if (!result)
        {
            return NotFound(new { message = "Bus not found" });
        }

        return Ok(new { message = "Bus deleted successfully" });
    }
}
