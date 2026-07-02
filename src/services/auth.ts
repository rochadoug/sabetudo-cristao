import { getAuth, signInAnonymously } from "firebase/auth";
import { app } from "./firebase";

export const auth = getAuth(app);

export async function signInAnon() {
  const cred = await signInAnonymously(auth);
  console.log("auth.currentUser:", auth.currentUser);
    console.log(auth.app.options.projectId);
  return cred;
}
