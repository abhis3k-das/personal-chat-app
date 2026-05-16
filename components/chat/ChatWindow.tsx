"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/MessageList";
import ChatInput from "@/components/chat/ChatInput";
import TypingIndicator from "@/components/chat/TypingIndicator";
import PinnedDateEvent from "@/components/chat/PinnedDateEvent";

import { Message, MessageType } from "@/types/message";
import { THEMES, ThemeId } from "@/constants/themes";
import { DateEvent } from "@/types/date-event";
import { DisplayDateEvent, getVisibleDateEvents } from "@/lib/dateEvents";

export default function ChatWindow() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [partnerId, setPartnerId] = useState("");
  const [partnerName, setPartnerName] = useState("Partner");
  const [messages, setMessages] = useState<Message[]>([]);

  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);
  const [partnerLastSeen, setPartnerLastSeen] = useState<any>(null);

  const [themeId, setThemeId] = useState<ThemeId>("purple");
  const selectedTheme = THEMES[themeId];

  const [dateEvents, setDateEvents] = useState<DisplayDateEvent[]>([]);

  const [currentUserMood, setCurrentUserMood] = useState<{
    mood: string;
    label: string;
    emoji: string;
  } | null>(null);

  const [partnerMood, setPartnerMood] = useState<{
    mood: string;
    label: string;
    emoji: string;
  } | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      setCurrentUser(user);

      await setDoc(
        doc(db, "users", user.uid),
        {
          online: true,
        },
        { merge: true }
      );

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();

        setPartnerId(userData.partnerId);

        if (userData.partnerId) {
          const partnerRef = doc(db, "users", userData.partnerId);
          const partnerSnap = await getDoc(partnerRef);

          if (partnerSnap.exists()) {
            const partnerData = partnerSnap.data();

            setPartnerName(partnerData.nickname || partnerData.name || "Partner");
          }
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

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

  useEffect(() => {
    const eventsQuery = query(collection(db, "dateEvents"));

    const unsubscribeEvents = onSnapshot(eventsQuery, (snapshot) => {
      const eventList: DateEvent[] = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...(docItem.data() as Omit<DateEvent, "id">),
      }));

      const visibleEvents = getVisibleDateEvents(eventList);

      setDateEvents(visibleEvents);
    });

    return () => unsubscribeEvents();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const moodRef = doc(db, "moods", currentUser.uid);

    const unsubscribeMood = onSnapshot(moodRef, (snapshot) => {
      if (!snapshot.exists()) {
        setCurrentUserMood(null);
        return;
      }

      const moodData = snapshot.data();

      setCurrentUserMood({
        mood: moodData.mood,
        label: moodData.label,
        emoji: moodData.emoji,
      });
    });

    return () => unsubscribeMood();
  }, [currentUser]);

  useEffect(() => {
    if (!partnerId) return;

    const moodRef = doc(db, "moods", partnerId);

    const unsubscribeMood = onSnapshot(moodRef, (snapshot) => {
      if (!snapshot.exists()) {
        setPartnerMood(null);
        return;
      }

      const moodData = snapshot.data();

      setPartnerMood({
        mood: moodData.mood,
        label: moodData.label,
        emoji: moodData.emoji,
      });
    });

    return () => unsubscribeMood();
  }, [partnerId]);

  useEffect(() => {
    if (!currentUser || !partnerId) return;

    const markPartnerMessagesAsSeen = async () => {
      const unseenMessagesQuery = query(
        collection(db, "messages"),
        where("senderId", "==", partnerId),
        where("receiverId", "==", currentUser.uid),
        where("status", "==", "sent")
      );

      const snapshot = await getDocs(unseenMessagesQuery);

      if (snapshot.empty) return;

      const batch = writeBatch(db);

      snapshot.docs.forEach((messageDoc) => {
        batch.update(messageDoc.ref, {
          status: "seen",
          seenAt: serverTimestamp(),
        });
      });

      await batch.commit();
    };

    markPartnerMessagesAsSeen();
  }, [currentUser, partnerId, messages.length]);

  useEffect(() => {
    if (!currentUser || !partnerId) return;

    const messagesQuery = query(
      collection(db, "messages"),
      where("participants", "array-contains", currentUser.uid),
      orderBy("createdAt", "asc")
    );

    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const messageList: Message[] = snapshot.docs
        .map((docItem) => ({
          id: docItem.id,
          ...(docItem.data() as Omit<Message, "id">),
        }))
        .filter((message) => {
          return (
            (message.senderId === currentUser.uid &&
              message.receiverId === partnerId) ||
            (message.senderId === partnerId &&
              message.receiverId === currentUser.uid)
          );
        });

      setMessages(messageList);
    });

    return () => unsubscribeMessages();
  }, [currentUser, partnerId]);

  useEffect(() => {
    if (!partnerId) return;

    const typingRef = doc(db, "typingStatus", partnerId);

    const unsubscribeTyping = onSnapshot(typingRef, (snapshot) => {
      if (!snapshot.exists()) {
        setIsPartnerTyping(false);
        return;
      }

      const typingData = snapshot.data();
      setIsPartnerTyping(Boolean(typingData.isTyping));
    });

    return () => unsubscribeTyping();
  }, [partnerId]);

  useEffect(() => {
    if (!partnerId) return;

    const partnerRef = doc(db, "users", partnerId);

    const unsubscribePartner = onSnapshot(partnerRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const partnerData = snapshot.data();

      setPartnerName(partnerData.nickname || partnerData.name || "Partner");
      setIsPartnerOnline(Boolean(partnerData.online));
      setPartnerLastSeen(partnerData.lastSeen || null);
    });

    return () => unsubscribePartner();
  }, [partnerId]);

  const handleLogout = async () => {
    if (!currentUser) return;

    await setDoc(
      doc(db, "users", currentUser.uid),
      {
        online: false,
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    );

    await setDoc(
      doc(db, "typingStatus", currentUser.uid),
      {
        isTyping: false,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    await signOut(auth);

    window.location.href = "/login";
  };

  const handleSelectMood = async (mood: {
    value: string;
    label: string;
    emoji: string;
  }) => {
    if (!currentUser) return;

    const moodRef = doc(db, "moods", currentUser.uid);

    await setDoc(
      moodRef,
      {
        mood: mood.value,
        label: mood.label,
        emoji: mood.emoji,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const handleSendMessage = async (
    text: string,
    type: MessageType = "text"
  ) => {
    if (!currentUser || !partnerId) return;

    await addDoc(collection(db, "messages"), {
      text,
      senderId: currentUser.uid,
      receiverId: partnerId,
      participants: [currentUser.uid, partnerId],
      status: "sent",
      type,
      reactions: {},
      isFavoriteBy: [],
      createdAt: serverTimestamp(),
      seenAt: null,
    });

    await handleTypingChange(false);
  };

  const handleReactToMessage = async (messageId: string, reaction: string) => {
    if (!currentUser) return;

    const messageRef = doc(db, "messages", messageId);

    await updateDoc(messageRef, {
      [`reactions.${currentUser.uid}`]: reaction,
    });
  };

  const handleToggleFavorite = async (
    messageId: string,
    isAlreadyFavorite: boolean
  ) => {
    if (!currentUser) return;

    const messageRef = doc(db, "messages", messageId);

    await updateDoc(messageRef, {
      isFavoriteBy: isAlreadyFavorite
        ? arrayRemove(currentUser.uid)
        : arrayUnion(currentUser.uid),
    });
  };

  const handleTypingChange = async (isTyping: boolean) => {
    if (!currentUser) return;

    const typingRef = doc(db, "typingStatus", currentUser.uid);

    await setDoc(
      typingRef,
      {
        isTyping,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  if (!currentUser) {
    return (
      <div className="rounded-3xl bg-white/80 p-8 shadow-xl">
        <p className="font-semibold text-purple-600">Loading chat...</p>
      </div>
    );
  }

  return (
    <div
      className={`flex h-[100dvh] w-full max-w-4xl flex-col overflow-hidden bg-white/80 shadow-xl backdrop-blur sm:h-[85vh] sm:rounded-3xl ${selectedTheme.border} sm:border`}
    >
      <ChatHeader
        partnerName={partnerName}
        partnerMood={partnerMood}
        currentUserMood={currentUserMood}
        isPartnerOnline={isPartnerOnline}
        partnerLastSeen={partnerLastSeen}
        onSelectMood={handleSelectMood}
        onLogout={handleLogout}
      />

      <PinnedDateEvent events={dateEvents} />

      <MessageList
        messages={messages}
        currentUserId={currentUser.uid}
        onReact={handleReactToMessage}
        onToggleFavorite={handleToggleFavorite}
      />

      <TypingIndicator isTyping={isPartnerTyping} partnerName={partnerName} />

      <ChatInput
        onSendMessage={handleSendMessage}
        onTypingChange={handleTypingChange}
      />
    </div>
  );
}