using Microsoft.AspNetCore.Mvc;
using SmartCampusBus.Api.Services;

namespace SmartCampusBus.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
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
        var routes = await _routeService.GetAllRoutesAsync();
        return Ok(routes);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRoute(string id)
    {
        var route = await _routeService.GetRouteByIdAsync(id);
        
        if (route == null)
        {
            return NotFound(new { message = "Route not found" });
        }

        return Ok(route);
    }

    [HttpPost]
    public async Task<IActionResult> CreateRoute([FromBody] Models.Route request)
    {
        if (string.IsNullOrEmpty(request.RouteName) || string.IsNullOrEmpty(request.StartPoint) || string.IsNullOrEmpty(request.EndPoint))
        {
            return BadRequest(new { message = "Route Name, Start Point, and End Point are required." });
        }

        var createdRoute = await _routeService.CreateRouteAsync(request);
        return CreatedAtAction(nameof(GetRoute), new { id = createdRoute.RouteId }, createdRoute);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRoute(string id, [FromBody] Models.Route request)
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

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRoute(string id)
    {
        var result = await _routeService.DeleteRouteAsync(id);
        
        if (!result)
        {
            return NotFound(new { message = "Route not found" });
        }

        return Ok(new { message = "Route deleted successfully" });
    }
}
