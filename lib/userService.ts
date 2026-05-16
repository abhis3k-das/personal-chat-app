import { User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const createOrUpdateUserProfile = async (user: User) => {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  const userData = {
    uid: user.uid,
    email: user.email || "",
    name: user.displayName || user.email?.split("@")[0] || "User",
    photoURL: user.photoURL || "",
    updatedAt: serverTimestamp(),
  };

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      ...userData,
      partnerName: "",
      createdAt: serverTimestamp(),
    });

    return;
  }

  await setDoc(userRef, userData, { merge: true });
};