import { MessageStatus } from "@/types/message";

interface ReadReceiptProps {
  status: MessageStatus;
}

export default function ReadReceipt({ status }: ReadReceiptProps) {
  if (status === "seen") return <span>👀</span>;

  if (status === "delivered") return <span>✓✓</span>;

  return <span>✓</span>;
}