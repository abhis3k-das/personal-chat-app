interface TypingIndicatorProps {
  isTyping: boolean;
  partnerName?: string;
}

export default function TypingIndicator({
  isTyping,
  partnerName = "Partner",
}: TypingIndicatorProps) {
  if (!isTyping) return null;

  return (
    <div className="px-5 pb-2">
      <p className="text-sm font-medium text-purple-500">
        {partnerName} is typing...
      </p>
    </div>
  );
}