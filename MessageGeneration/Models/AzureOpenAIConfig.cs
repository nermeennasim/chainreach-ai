public class AzureOpenAIConfig
{
    public string Endpoint { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string DeploymentName { get; set; } = "gpt-4";
    public int MaxTokens { get; set; } = 150;
    public float Temperature { get; set; } = 0.8f;
    public float FrequencyPenalty { get; set; } = 0.3f;
    public float PresencePenalty { get; set; } = 0.3f;
    public int TimeoutSeconds { get; set; } = 30;

    public bool IsConfigured => 
        !string.IsNullOrEmpty(Endpoint) && 
        !string.IsNullOrEmpty(ApiKey);
}
