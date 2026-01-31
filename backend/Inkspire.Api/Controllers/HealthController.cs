using Microsoft.AspNetCore.Mvc;

namespace Inkspire.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Route("[controller]")] // Also allow /health for Docker health checks
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
    }
}
