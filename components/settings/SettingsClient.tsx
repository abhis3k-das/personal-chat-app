"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  addDoc,
  arrayRemove,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

import { auth, db } from "@/lib/firebase";
import { THEMES, ThemeId } from "@/constants/themes";
import { DateEvent, DateEventType } from "@/types/date-event";
import { Message } from "@/types/message";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";

type DateFormState = {
  title: string;
  date: string;
  notes: string;
};

const EMPTY_FORM: DateFormState = {
  title: "",
  date: "",
  notes: "",
};

function formatMessageDate(createdAt: any) {
  if (!createdAt?.toDate) return "";

  return createdAt.toDate().toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SettingsClient() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [themeId, setThemeId] = useState<ThemeId>("purple");
  const [events, setEvents] = useState<DateEvent[]>([]);
  const [favoriteMessages, setFavoriteMessages] = useState<Message[]>([]);

  const [importantForm, setImportantForm] =
    useState<DateFormState>(EMPTY_FORM);
  const [upcomingForm, setUpcomingForm] = useState<DateFormState>(EMPTY_FORM);

  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [profilePhotoURL, setProfilePhotoURL] = useState("");
  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
  const selectedTheme = THEMES[themeId];

  const importantDates = useMemo(() => {
    return events.filter((event) => event.type === "important");
  }, [events]);

  const upcomingDates = useMemo(() => {
    return events.filter((event) => event.type === "upcoming");
  }, [events]);

  useEffect(() => {
    if (!currentUser) return;

    const userRef = doc(db, "users", currentUser.uid);

    const unsubscribeUser = onSnapshot(userRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const userData = snapshot.data();
      setProfilePhotoURL(userData.photoURL || "");
    });

    return () => unsubscribeUser();
  }, [currentUser]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const settingsRef = doc(db, "settings", "couple");

    const unsubscribeSettings = onSnapshot(settingsRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const data = snapshot.data();

      if (data.themeId && THEMES[data.themeId as ThemeId]) {
        setThemeId(data.themeId as ThemeId);
      }
    });

    return () => unsubscribeSettings();
  }, []);

  useEffect(() => {
    const eventsQuery = query(
      collection(db, "dateEvents"),
      orderBy("date", "asc")
    );

    const unsubscribeEvents = onSnapshot(eventsQuery, (snapshot) => {
      const eventList: DateEvent[] = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...(docItem.data() as Omit<DateEvent, "id">),
      }));

      setEvents(eventList);
    });

    return () => unsubscribeEvents();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const favoriteMessagesQuery = query(
      collection(db, "messages"),
      where("isFavoriteBy", "array-contains", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribeFavorites = onSnapshot(favoriteMessagesQuery, (snapshot) => {
      const messageList: Message[] = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...(docItem.data() as Omit<Message, "id">),
      }));

      setFavoriteMessages(messageList);
    });

    return () => unsubscribeFavorites();
  }, [currentUser]);

  const handleProfilePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file || !currentUser) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const isImage = allowedTypes.includes(file.type);
    const maxSizeInBytes = 2 * 1024 * 1024; // 2 MB

    if (!isImage) {
      alert("Please upload JPG, PNG, or WEBP only.");
      return;
    }

    if (file.size > maxSizeInBytes) {
      alert("Image size should be less than 2 MB.");
      return;
    }

    setUploadingProfilePhoto(true);
    setSuccessMessage("");

    try {
      const extensionMap: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
      };

      const fileExtension = extensionMap[file.type];

      const storageRef = ref(
        storage,
        `profile-images/${currentUser.uid}/profile.${fileExtension}`
      );

      await uploadBytes(storageRef, file);

      const downloadURL = await getDownloadURL(storageRef);

      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          photoURL: downloadURL,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setSuccessMessage("Profile photo updated successfully 💜");
    } finally {
      setUploadingProfilePhoto(false);
      event.target.value = "";
    }
  };

  const handleSaveTheme = async () => {
    setSaving(true);
    setSuccessMessage("");

    try {
      const settingsRef = doc(db, "settings", "couple");

      await setDoc(
        settingsRef,
        {
          themeId,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      localStorage.setItem("onlyus-theme", themeId);
      setSuccessMessage("Theme saved successfully 💜");
    } finally {
      setSaving(false);
    }
  };

  const getFormByType = (type: DateEventType) => {
    return type === "important" ? importantForm : upcomingForm;
  };

  const setFormByType = (type: DateEventType, form: DateFormState) => {
    if (type === "important") {
      setImportantForm(form);
      return;
    }

    setUpcomingForm(form);
  };

  const handleSaveDateEvent = async (type: DateEventType) => {
    const form = getFormByType(type);

    const title = form.title.trim();
    const notes = form.notes.trim();
    const date = form.date;

    if (!title || !date) return;

    setSaving(true);
    setSuccessMessage("");

    try {
      if (editingEventId) {
        const eventRef = doc(db, "dateEvents", editingEventId);

        await updateDoc(eventRef, {
          title,
          notes,
          date,
          type,
          updatedAt: serverTimestamp(),
        });

        setSuccessMessage("Date updated successfully 💜");
      } else {
        await addDoc(collection(db, "dateEvents"), {
          title,
          notes,
          date,
          type,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        setSuccessMessage("Date added successfully 💜");
      }

      setFormByType(type, EMPTY_FORM);
      setEditingEventId(null);
    } finally {
      setSaving(false);
    }
  };

  const handleEditDateEvent = (event: DateEvent) => {
    setEditingEventId(event.id);

    const formValue = {
      title: event.title,
      date: event.date,
      notes: event.notes || "",
    };

    if (event.type === "important") {
      setImportantForm(formValue);
      setUpcomingForm(EMPTY_FORM);
      return;
    }

    setUpcomingForm(formValue);
    setImportantForm(EMPTY_FORM);
  };

  const handleCancelEdit = () => {
    setEditingEventId(null);
    setImportantForm(EMPTY_FORM);
    setUpcomingForm(EMPTY_FORM);
  };

  const handleDeleteDateEvent = async (eventId: string) => {
    await deleteDoc(doc(db, "dateEvents", eventId));

    if (editingEventId === eventId) {
      handleCancelEdit();
    }
  };

  const handleRemoveFavoriteMessage = async (messageId: string) => {
    if (!currentUser) return;

    const messageRef = doc(db, "messages", messageId);

    await updateDoc(messageRef, {
      isFavoriteBy: arrayRemove(currentUser.uid),
    });
  };

  const renderDateForm = (
    title: string,
    description: string,
    type: DateEventType,
    form: DateFormState
  ) => {
    const isEditingThisType =
      editingEventId &&
      events.find((event) => event.id === editingEventId)?.type === type;

    return (
      <div className="rounded-3xl bg-white/80 p-6 shadow-xl backdrop-blur">
        <div className="mb-5">
          <h2 className={`text-xl font-bold ${selectedTheme.text}`}>
            {title}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setFormByType(type, {
                  ...form,
                  title: e.target.value,
                })
              }
              placeholder={
                type === "important" ? "Anniversary" : "Next meetup"
              }
              className={`w-full rounded-xl border ${selectedTheme.border} px-4 py-3 outline-none focus:border-purple-500`}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) =>
                setFormByType(type, {
                  ...form,
                  date: e.target.value,
                })
              }
              className={`w-full rounded-xl border ${selectedTheme.border} px-4 py-3 outline-none focus:border-purple-500`}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) =>
                setFormByType(type, {
                  ...form,
                  notes: e.target.value,
                })
              }
              rows={3}
              placeholder="Add a small note..."
              className={`w-full resize-none rounded-xl border ${selectedTheme.border} px-4 py-3 outline-none focus:border-purple-500`}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveDateEvent(type)}
              className={`flex-1 rounded-xl ${selectedTheme.primary} ${selectedTheme.primaryHover} py-3 font-semibold text-white shadow-md disabled:opacity-60`}
            >
              {isEditingThisType ? "Update date" : "Add date"}
            </button>

            {editingEventId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-xl bg-gray-100 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDateList = (
    title: string,
    emptyMessage: string,
    dateEvents: DateEvent[]
  ) => {
    return (
      <div className="rounded-3xl bg-white/70 p-6 shadow-xl backdrop-blur">
        <h2 className={`mb-4 text-xl font-bold ${selectedTheme.text}`}>
          {title}
        </h2>

        {dateEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-purple-200 px-4 py-8 text-center text-sm text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-3">
            {dateEvents.map((event) => (
              <article
                key={event.id}
                className="rounded-2xl bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-gray-800">{event.title}</h3>
                    <p className="mt-1 text-sm font-semibold text-purple-600">
                      {event.date}
                    </p>
                    {event.notes && (
                      <p className="mt-2 whitespace-pre-line text-sm text-gray-600">
                        {event.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditDateEvent(event)}
                      className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 hover:bg-purple-100"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteDateEvent(event.id)}
                      className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <main
      className={`min-h-screen bg-gradient-to-br ${selectedTheme.background} px-4 py-8`}
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-bold ${selectedTheme.text}`}>
              Settings ⚙️
            </h1>
            <p className="mt-1 text-gray-600">
              Customize themes, dates, and favorite messages.
            </p>
          </div>

          <Link
            href="/chat"
            className="rounded-xl bg-white/80 px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm hover:bg-white"
          >
            Back to chat
          </Link>
        </div>

        {successMessage && (
          <p className="mb-5 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {successMessage}
          </p>
        )}

        {/* <div className="mb-6 rounded-3xl bg-white/80 p-6 shadow-xl backdrop-blur">
          <div className="mb-4">
            <h2 className={`text-xl font-bold ${selectedTheme.text}`}>
              Profile Photo
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Upload a small profile picture for your chat avatar.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-purple-100 text-2xl font-bold text-purple-700">
              {profilePhotoURL ? (
                <img
                  src={profilePhotoURL}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                currentUser?.email?.charAt(0).toUpperCase() || "U"
              )}
            </div>

            <div>
              <label className="inline-flex cursor-pointer rounded-xl bg-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-purple-600">
                {uploadingProfilePhoto ? "Uploading..." : "Upload photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingProfilePhoto}
                  onChange={handleProfilePhotoUpload}
                />
              </label>

              <p className="mt-2 text-xs text-gray-500">
                Image only. Max size 2 MB.
              </p>
            </div>
          </div>
        </div> */}
        <div className="mb-6 rounded-3xl bg-white/80 p-6 shadow-xl backdrop-blur">
          <p className="mb-3 block text-sm font-medium text-gray-700">Theme</p>

          <div className="grid gap-3 sm:grid-cols-3">
            {(Object.keys(THEMES) as ThemeId[]).map((id) => {
              const theme = THEMES[id];
              const isSelected = themeId === id;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setThemeId(id)}
                  className={`rounded-2xl border p-4 text-left transition ${isSelected
                    ? "border-purple-500 bg-purple-50 shadow-md"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                >
                  <div
                    className={`mb-3 h-16 rounded-xl bg-gradient-to-br ${theme.background}`}
                  />

                  <p className="font-semibold text-gray-800">{theme.name}</p>

                  <p className="mt-1 text-xs text-gray-500">
                    {isSelected ? "Selected" : "Tap to select"}
                  </p>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={handleSaveTheme}
            className={`mt-5 w-full rounded-xl ${selectedTheme.primary} ${selectedTheme.primaryHover} py-3 font-semibold text-white shadow-md disabled:opacity-60`}
          >
            {saving ? "Saving..." : "Save theme"}
          </button>
        </div>

        <div className="mb-6 rounded-3xl bg-white/80 p-6 shadow-xl backdrop-blur">
          <div className="mb-4">
            <h2 className={`text-xl font-bold ${selectedTheme.text}`}>
              Favorite Messages ⭐
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Messages you marked as special in chat.
            </p>
          </div>

          {favoriteMessages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-purple-200 px-4 py-8 text-center text-sm text-gray-500">
              No favorite messages yet.
            </div>
          ) : (
            <div className="space-y-3">
              {favoriteMessages.map((message) => (
                <article
                  key={message.id}
                  className="rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/chat?messageId=${message.id}`}
                      className="min-w-0 flex-1"
                      title="Open this message in chat"
                    >
                      <p className="whitespace-pre-line text-sm font-medium leading-6 text-gray-800">
                        {message.text}
                      </p>

                      <p className="mt-2 text-xs font-semibold text-gray-400">
                        {formatMessageDate(message.createdAt)}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-purple-500">
                        Open in chat →
                      </p>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleRemoveFavoriteMessage(message.id)}
                      className="shrink-0 rounded-full bg-yellow-50 px-3 py-1 text-xs font-bold text-yellow-700 hover:bg-red-50 hover:text-red-600"
                      title="Remove from favorites"
                    >
                      ⭐ Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {renderDateForm(
            "Important Dates",
            "Repeats every year, like anniversaries or birthdays.",
            "important",
            importantForm
          )}

          {renderDateList(
            "Marked Important Dates",
            "No important dates added yet.",
            importantDates
          )}

          {renderDateForm(
            "Upcoming Dates",
            "One-time plans, like meetup, trip, movie, or dinner.",
            "upcoming",
            upcomingForm
          )}

          {renderDateList(
            "Marked Upcoming Dates",
            "No upcoming dates added yet.",
            upcomingDates
          )}
        </div>
      </div>
    </main>
  );
}