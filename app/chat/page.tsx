import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ChatPageClient from "@/components/chat/ChatPageClient";

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatPageClient />
    </ProtectedRoute>
  );
}