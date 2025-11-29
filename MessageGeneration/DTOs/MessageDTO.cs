namespace MessageGeneration.DTOs;

public record MessageRequest(
    string CustomerId,
    string Segment,
    List<ApprovedContent> ApprovedContent,
    CustomerInfo CustomerContext
);

public record ApprovedContent(string ContentId, string Text);

public record CustomerInfo(string Name);

public record MessageResponse(
    string MessageId,
    DateTime GeneratedAt,
    List<MessageVariant> Variants,
    double GenerationTimeMs
);

public record MessageVariant(
    string VariantId,
    string Message,
    string Tone,
    List<string> Citations,
    int CharacterCount
);