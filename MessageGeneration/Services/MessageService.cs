using System.Diagnostics;
using Azure;
using System.ClientModel; 
using MessageGeneration.DTOs;
using Azure.AI.OpenAI;
using OpenAI.Chat;

public class MessageService
{
    private readonly ILogger<MessageService> _logger;
    private readonly IConfiguration _config;
    private readonly AzureOpenAIClient? _client;
    private readonly ChatClient? _chatClient;
    private readonly string _deploymentName;

    public MessageService(IConfiguration config, ILogger<MessageService> logger)
    {
        _config = config;
        _logger = logger;
        _deploymentName = config["AzureOpenAI:DeploymentName"] ?? "gpt-4";

        var endpoint = config["AzureOpenAI:Endpoint"];
        var apiKey = config["AzureOpenAI:ApiKey"];

        if (!string.IsNullOrEmpty(endpoint) && !string.IsNullOrEmpty(apiKey))
        {
            try
            {
                _client = new AzureOpenAIClient(
                    new Uri(endpoint),
                    new AzureKeyCredential(apiKey)
                );
                _chatClient = _client.GetChatClient(_deploymentName);
                _logger.LogInformation("Azure OpenAI configured successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to initialize Azure OpenAI client");
            }
        }
        else
        {
            _logger.LogWarning("Azure OpenAI not configured - using mock mode");
        }
    }

    public async Task<MessageResponse> GenerateAsync(MessageRequest request)
    {
        var sw = Stopwatch.StartNew();
        var messageId = $"MSG-{Guid.NewGuid():N}"[..12];

        _logger.LogInformation("Generating messages for customer {CustomerId}", request.CustomerId);

        // Validate
        if (request.ApprovedContent == null || !request.ApprovedContent.Any())
        {
            throw new ArgumentException("ApprovedContent is required");
        }

        if (string.IsNullOrEmpty(request.CustomerContext?.Name))
        {
            throw new ArgumentException("Customer name is required");
        }

        var variants = new List<MessageVariant>();
        var tones = new[] 
        { 
            ("friendly", "warm and conversational"),
            ("enthusiastic", "energetic and exciting"),
            ("professional", "formal and respectful")
        };

        foreach (var (tone, description) in tones)
        {
            string message;

            if (_chatClient != null)
            {
                try
                {
                    message = await GenerateWithAIAsync(request, tone, description);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "AI generation failed for {Tone}, using fallback", tone);
                    message = GenerateMockMessage(request, tone);
                }
            }
            else
            {
                message = GenerateMockMessage(request, tone);
            }

            variants.Add(new MessageVariant(
                VariantId: $"{messageId}-{tone[..3].ToUpper()}",
                Message: message,
                Tone: tone,
                Citations: request.ApprovedContent.Select(c => c.ContentId).ToList(),
                CharacterCount: message.Length
            ));

            _logger.LogDebug("Generated {Tone} variant: {Message}", tone, message);
        }

        sw.Stop();
        
        _logger.LogInformation(
            "Generated {Count} variants in {Duration}ms", 
            variants.Count, 
            sw.ElapsedMilliseconds
        );

        return new MessageResponse(messageId, DateTime.UtcNow, variants, sw.ElapsedMilliseconds);
    }

    private async Task<string> GenerateWithAIAsync(
        MessageRequest request, 
        string tone, 
        string toneDescription)
    {
        var content = request.ApprovedContent.First();
        
        var systemPrompt = $@"You are an expert marketing copywriter creating personalized messages.
        Create a {toneDescription} message that is engaging and authentic.
        Customer segment: {request.Segment}";

        var userPrompt = $@"Create a marketing message with these requirements:
        - Customer name: {request.CustomerContext.Name}
        - Content to include: {content.Text}
        - Tone: {tone} ({toneDescription})
        - Length: 60-100 characters
        - Make it personal and include a clear call-to-action

        Return ONLY the message text, no explanations or quotes.";

        var messages = new List<ChatMessage>
        {
            new SystemChatMessage(systemPrompt),
            new UserChatMessage(userPrompt)
        };

        var options = new ChatCompletionOptions
        {
            MaxOutputTokenCount = 150,
            Temperature = 0.8f,
            FrequencyPenalty = 0.3f,
            PresencePenalty = 0.3f
        };

        var completion = await _chatClient!.CompleteChatAsync(messages, options);
        
        return completion.Value.Content[0].Text.Trim();
    }

    private string GenerateMockMessage(MessageRequest request, string tone)
    {
        var name = request.CustomerContext.Name;
        var content = request.ApprovedContent.First().Text;

        return tone switch
        {
            "friendly" => $"Hi {name}! {content} - we thought you'd love this!",
            "enthusiastic" => $"{name}! Exciting news: {content} Don't miss out!",
            "professional" => $"Dear {name}, you're eligible for: {content}. Best regards.",
            _ => $"Hello {name}, {content}"
        };
    }
}