using MessageGeneration.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
[ApiController]
[Route("api/message")]
public class MessageController : ControllerBase
{
    private readonly MessageService _service;
    private readonly ILogger<MessageController> _logger;
    private readonly IConfiguration _config;

    public MessageController(MessageService service, ILogger<MessageController> logger, IConfiguration config)
    {
        _service = service;
        _logger = logger;
        _config = config;
    }
    

    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new
        {
            status = "healthy",
            service = "Message Generation API",
            timestamp = DateTime.UtcNow
        });
    }

    [HttpPost("generate")]
    public async Task<ActionResult<MessageResponse>> Generate([FromBody] MessageRequest request)
    {
        try
        {
            _logger.LogInformation("Generating messages for {CustomerId}", request.CustomerId);
            var response = await _service.GenerateAsync(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Generation failed");
            return StatusCode(500, new { error = ex.Message });
        }
    }
    [HttpGet("test-ai")]
    public IActionResult TestAI()
    {
    var endpoint = _config["AzureOpenAI:Endpoint"];
    var hasKey = !string.IsNullOrEmpty(_config["AzureOpenAI:ApiKey"]);
    var deployment = _config["AzureOpenAI:DeploymentName"];

    return Ok(new
    {
        endpoint = endpoint,
        hasApiKey = hasKey,
        deploymentName = deployment,
        status = hasKey && !string.IsNullOrEmpty(endpoint) ? "configured" : "not configured"
    });
    }
    [HttpGet("logs")]
    public async Task<IActionResult> GetLogs([FromQuery] int limit = 10)
    {
    try
    {
        var logFile = "message-generation-log.json";
        
        if (!System.IO.File.Exists(logFile))
        {
            return Ok(new { message = "No logs yet", logs = new List<object>() });
        }

        var content = await System.IO.File.ReadAllTextAsync(logFile);
        var logs = System.Text.Json.JsonSerializer.Deserialize<List<object>>(content) 
                   ?? new List<object>();

        // Return last N entries
        var recentLogs = logs.TakeLast(limit).ToList();

        return Ok(new 
        { 
            total = logs.Count,
            showing = recentLogs.Count,
            logs = recentLogs 
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Failed to read logs");
        return StatusCode(500, new { error = "Failed to read logs" });
    }

}
}