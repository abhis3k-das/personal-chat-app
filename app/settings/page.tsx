import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SettingsClient from "@/components/settings/SettingsClient";

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsClient />
    </ProtectedRoute>
  );
}