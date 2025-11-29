public class GenerationConfig
{
    public int MaxTokens { get; set; } = 150;
    public float DefaultTemperature { get; set; } = 0.8f;
    public int MaxMessageLength { get; set; } = 100;
    public int MinMessageLength { get; set; } = 50;
    public bool EnableFallbackMode { get; set; } = true;
    public int TimeoutSeconds { get; set; } = 10;
}
