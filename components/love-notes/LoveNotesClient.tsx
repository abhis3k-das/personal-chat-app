"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

import { auth, db } from "@/lib/firebase";
import { LoveNote } from "@/types/love-note";

function formatDate(createdAt: any) {
  if (!createdAt?.toDate) return "";

  return createdAt.toDate().toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function LoveNotesClient() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<LoveNote[]>([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const notesQuery = query(
      collection(db, "loveNotes"),
      orderBy("createdAt", "desc")
    );

    const unsubscribeNotes = onSnapshot(notesQuery, (snapshot) => {
      const noteList: LoveNote[] = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...(docItem.data() as Omit<LoveNote, "id">),
      }));

      setNotes(noteList);
    });

    return () => unsubscribeNotes();
  }, []);

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!currentUser || !trimmedTitle || !trimmedContent) return;

    setSaving(true);

    try {
      await addDoc(collection(db, "loveNotes"), {
        title: trimmedTitle,
        content: trimmedContent,
        createdBy: currentUser.uid,
        isFavorite: false,
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setContent("");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFavorite = async (note: LoveNote) => {
    const noteRef = doc(db, "loveNotes", note.id);

    await updateDoc(noteRef, {
      isFavorite: !note.isFavorite,
    });
  };

  const handleDeleteNote = async (noteId: string) => {
    const noteRef = doc(db, "loveNotes", noteId);

    await deleteDoc(noteRef);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-violet-100 to-fuchsia-100 px-4 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-purple-700">
              Love Notes 💌
            </h1>
            <p className="mt-1 text-gray-600">
              Save little memories, promises, and sweet words.
            </p>
          </div>

          <a
            href="/chat"
            className="rounded-xl bg-white/80 px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm hover:bg-white"
          >
            Back to chat
          </a>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <form
            onSubmit={handleSaveNote}
            className="rounded-3xl bg-white/80 p-6 shadow-xl backdrop-blur"
          >
            <h2 className="mb-4 text-xl font-bold text-purple-700">
              Add a note
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Things I love about you"
                  className="w-full rounded-xl border border-purple-200 px-4 py-3 outline-none focus:border-purple-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  placeholder="Write something sweet..."
                  rows={7}
                  className="w-full resize-none rounded-xl border border-purple-200 px-4 py-3 outline-none focus:border-purple-500"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-purple-500 py-3 font-semibold text-white shadow-md hover:bg-purple-600 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save note"}
              </button>
            </div>
          </form>

          <section className="rounded-3xl bg-white/70 p-6 shadow-xl backdrop-blur">
            <h2 className="mb-4 text-xl font-bold text-purple-700">
              Saved notes
            </h2>

            {notes.length === 0 ? (
              <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-purple-200">
                <p className="text-center text-gray-500">
                  No love notes yet 💕
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <article
                    key={note.id}
                    className="rounded-2xl bg-white p-5 shadow-sm"
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          {note.title}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {formatDate(note.createdAt)}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleFavorite(note)}
                          className="rounded-full bg-purple-50 px-3 py-1 text-sm hover:bg-purple-100"
                          title="Favorite"
                        >
                          {note.isFavorite ? "⭐" : "☆"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          className="rounded-full bg-red-50 px-3 py-1 text-sm text-red-600 hover:bg-red-100"
                          title="Delete"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <p className="whitespace-pre-line text-sm leading-6 text-gray-700">
                      {note.content}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}