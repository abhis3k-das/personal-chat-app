"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { THEMES, ThemeId } from "@/constants/themes";
import ChatWindow from "@/components/chat/ChatWindow";

export default function ChatPageClient() {
  const [themeId, setThemeId] = useState<ThemeId>("purple");

  const selectedTheme = THEMES[themeId];

  useEffect(() => {
    const settingsRef = doc(db, "settings", "couple");

    const unsubscribeSettings = onSnapshot(settingsRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const settingsData = snapshot.data();

      if (settingsData.themeId && THEMES[settingsData.themeId as ThemeId]) {
        setThemeId(settingsData.themeId as ThemeId);
        localStorage.setItem("onlyus-theme", settingsData.themeId);
      }
    });

    return () => unsubscribeSettings();
  }, []);

  return (
    <main
      className={`flex min-h-screen items-center justify-center bg-gradient-to-br ${selectedTheme.background} px-0 sm:px-4`}
    >
      <ChatWindow />
    </main>
  );
}