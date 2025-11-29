public class ToneStrategy
{
     public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string SystemPrompt { get; set; } = string.Empty;
    public float Temperature { get; set; } = 0.8f;
}
public static class ToneStrategies
{
    public static readonly List<ToneStrategy> Available = new()
    {
        new ToneStrategy
        {
            Name = "friendly",
            Description = "Warm, conversational, and approachable",
            SystemPrompt = "Create a friendly, warm message that feels personal and conversational",
            Temperature = 0.8f
        },
        new ToneStrategy
        {
            Name = "enthusiastic",
            Description = "Energetic, exciting, and action-oriented",
            SystemPrompt = "Create an enthusiastic, energetic message that creates excitement",
            Temperature = 0.9f
        },
        new ToneStrategy
        {
            Name = "professional",
            Description = "Formal, respectful, and authoritative",
            SystemPrompt = "Create a professional, formal message that conveys respect and authority",
            Temperature = 0.6f
        }
    };
}
