import ProtectedRoute from "@/components/auth/ProtectedRoute";
import LoveNotesClient from "@/components/love-notes/LoveNotesClient";

export default function LoveNotesPage() {
  return (
    <ProtectedRoute>
      <LoveNotesClient />
    </ProtectedRoute>
  );
}