using Microsoft.AspNetCore.Mvc;
using SmartCampusBus.Api.Services;

using Microsoft.AspNetCore.Authorization;

namespace SmartCampusBus.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")]
public class RouteController : ControllerBase
{
    private readonly IRouteService _routeService;

    public RouteController(IRouteService routeService)
    {
        _routeService = routeService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllRoutes()
    {
        try
        {
            var routes = await _routeService.GetAllRoutesAsync();
            return Ok(routes);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Server error: {ex.Message}" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRoute(string id)
    {
        try
        {
            var route = await _routeService.GetRouteByIdAsync(id);
            
            if (route == null)
            {
                return NotFound(new { message = "Route not found" });
            }

            return Ok(route);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Server error: {ex.Message}" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateRoute([FromBody] Models.Route request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.RouteName) || string.IsNullOrEmpty(request.StartPoint) || string.IsNullOrEmpty(request.EndPoint))
            {
                return BadRequest(new { message = "Route Name, Start Point, and End Point are required." });
            }

            var createdRoute = await _routeService.CreateRouteAsync(request);
            return CreatedAtAction(nameof(GetRoute), new { id = createdRoute.RouteId }, createdRoute);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Server error: {ex.Message}" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRoute(string id, [FromBody] Models.Route request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.RouteName) || string.IsNullOrEmpty(request.StartPoint) || string.IsNullOrEmpty(request.EndPoint))
            {
                return BadRequest(new { message = "Route Name, Start Point, and End Point are required." });
            }

            var result = await _routeService.UpdateRouteAsync(id, request);
            
            if (!result)
            {
                return NotFound(new { message = "Route not found" });
            }

            return Ok(new { message = "Route updated successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Server error: {ex.Message}" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRoute(string id)
    {
        try
        {
            var result = await _routeService.DeleteRouteAsync(id);
            
            if (!result)
            {
                return NotFound(new { message = "Route not found" });
            }

            return Ok(new { message = "Route deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Server error: {ex.Message}" });
        }
    }
}
