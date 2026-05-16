"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
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
import { DEFAULT_THEME_ID, THEMES, ThemeId } from "@/constants/themes";
import { DateEvent } from "@/types/date-event";
import { DisplayDateEvent, getVisibleDateEvents } from "@/lib/dateEvents";

export default function ChatWindow() {
  const searchParams = useSearchParams();
  const highlightedMessageId = searchParams.get("messageId");

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [partnerId, setPartnerId] = useState("");
  const [partnerActualName, setPartnerActualName] = useState("Partner");
  const [currentUserPartnerName, setCurrentUserPartnerName] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);

  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);
  const [partnerLastSeen, setPartnerLastSeen] = useState<any>(null);
  const [partnerPhotoURL, setPartnerPhotoURL] = useState("");

  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME_ID)
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

  const partnerName = useMemo(() => {
    return currentUserPartnerName.trim() || partnerActualName || "Partner";
  }, [currentUserPartnerName, partnerActualName]);

  const resetPartnerData = () => {
    setMessages([]);
    setPartnerActualName("Partner");
    setPartnerMood(null);
    setIsPartnerTyping(false);
    setIsPartnerOnline(false);
    setPartnerLastSeen(null);
    setPartnerPhotoURL("");
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      setCurrentUser(user);

      const actualName =
        user.displayName || user.email?.split("@")[0] || "User";

      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          name: actualName,
          email: user.email || "",
          photoURL: user.photoURL || "",
          online: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const currentUserRef = doc(db, "users", currentUser.uid);

    const unsubscribeCurrentUser = onSnapshot(currentUserRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const userData = snapshot.data();

      const savedPartnerId = userData.partnerId || "";

      setPartnerId(savedPartnerId);
      setCurrentUserPartnerName(userData.partnerName || "");

      if (!savedPartnerId) {
        resetPartnerData();
      }
    });

    return () => unsubscribeCurrentUser();
  }, [currentUser]);

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
    if (!partnerId) {
      setPartnerMood(null);
      return;
    }

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
    if (!currentUser || !partnerId) {
      setMessages([]);
      return;
    }

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
    if (!partnerId) {
      setIsPartnerTyping(false);
      return;
    }

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
    if (!partnerId) {
      setPartnerActualName("Partner");
      setPartnerPhotoURL("");
      setIsPartnerOnline(false);
      setPartnerLastSeen(null);
      return;
    }

    const partnerRef = doc(db, "users", partnerId);

    const unsubscribePartner = onSnapshot(partnerRef, (snapshot) => {
      if (!snapshot.exists()) {
        setPartnerActualName("Partner");
        setPartnerPhotoURL("");
        setIsPartnerOnline(false);
        setPartnerLastSeen(null);
        return;
      }

      const partnerData = snapshot.data();

      setPartnerActualName(
        partnerData.name || partnerData.nickname || "Partner"
      );

      setPartnerPhotoURL(partnerData.photoURL || "");
      setIsPartnerOnline(Boolean(partnerData.online));
      setPartnerLastSeen(partnerData.lastSeen || null);
    });

    return () => unsubscribePartner();
  }, [partnerId]);

  const canModifyMessage = (message: Message) => {
    if (!currentUser) return false;
    if (message.senderId !== currentUser.uid) return false;
    if (!message.createdAt?.toDate) return false;

    const createdTime = message.createdAt.toDate().getTime();
    const now = Date.now();

    return now - createdTime <= 5 * 60 * 1000;
  };

  const handleEditMessage = async (messageId: string, updatedText: string) => {
    const message = messages.find((item) => item.id === messageId);

    if (!message) return;
    if (!canModifyMessage(message)) return;

    const messageRef = doc(db, "messages", messageId);

    await updateDoc(messageRef, {
      text: updatedText,
      editedAt: serverTimestamp(),
    });
  };

  const handleDeleteMessage = async (messageId: string) => {
    const message = messages.find((item) => item.id === messageId);

    if (!message) return;
    if (!canModifyMessage(message)) return;

    await deleteDoc(doc(db, "messages", messageId));
  };

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
    if (!currentUser || !partnerId) return;

    const messageRef = doc(db, "messages", messageId);

    await updateDoc(messageRef, {
      [`reactions.${currentUser.uid}`]: reaction,
    });
  };

  const handleToggleFavorite = async (
    messageId: string,
    isAlreadyFavorite: boolean
  ) => {
    if (!currentUser || !partnerId) return;

    const messageRef = doc(db, "messages", messageId);

    await updateDoc(messageRef, {
      isFavoriteBy: isAlreadyFavorite
        ? arrayRemove(currentUser.uid)
        : arrayUnion(currentUser.uid),
    });
  };

  const handleTypingChange = async (isTyping: boolean) => {
    if (!currentUser || !partnerId) return;

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

  if (!partnerId) {
    return (
      <div
        className={`flex h-[100dvh] w-full max-w-4xl items-center justify-center overflow-hidden bg-white/80 px-4 shadow-xl backdrop-blur sm:h-[85vh] sm:rounded-3xl ${selectedTheme.border} sm:border`}
      >
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-3xl">
            🔗
          </div>

          <h1 className={`text-2xl font-bold ${selectedTheme.text}`}>
            Partner not connected
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            Add your partner&apos;s user ID from Settings to unlock the private
            chat. Until then, messages and chat input will stay hidden.
          </p>

          <div className="mt-5 rounded-2xl bg-gray-50 p-4 text-left">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
              Your User ID
            </p>

            <code className="mt-2 block break-all text-xs font-semibold text-gray-700">
              {currentUser.uid}
            </code>
          </div>

          <Link
            href="/settings"
            className={`mt-6 inline-flex w-full items-center justify-center rounded-xl ${selectedTheme.primary} ${selectedTheme.primaryHover} px-4 py-3 font-semibold text-white shadow-md`}
          >
            Open Settings
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 w-full rounded-xl bg-gray-100 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-200"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex h-[100dvh] w-full max-w-4xl flex-col overflow-hidden bg-white/80 shadow-xl backdrop-blur sm:h-[85vh] sm:rounded-3xl ${selectedTheme.border} sm:border`}
    >


      <ChatHeader
        partnerName={partnerName}
        partnerPhotoURL={''}
        // partnerPhotoURL={partnerPhotoURL}
        partnerMood={partnerMood}
        currentUserMood={currentUserMood}
        dateEvents={dateEvents}
        isPartnerOnline={isPartnerOnline}
        partnerLastSeen={partnerLastSeen}
        themeId={themeId}
        onSelectMood={handleSelectMood}
        onLogout={handleLogout}
      />
      <PinnedDateEvent events={dateEvents} />

      <MessageList
        messages={messages}
        currentUserId={currentUser.uid}
        highlightedMessageId={highlightedMessageId}
        onReact={handleReactToMessage}
        onToggleFavorite={handleToggleFavorite}
        onEditMessage={handleEditMessage}
        onDeleteMessage={handleDeleteMessage}
      />

      <TypingIndicator isTyping={isPartnerTyping} partnerName={partnerName} />

      <ChatInput
        themeId={themeId}
        onSendMessage={handleSendMessage}
        onTypingChange={handleTypingChange}
      />
    </div>
  );
}