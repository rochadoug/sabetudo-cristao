import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../services/auth";


type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInAnon: () => Promise<User>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  async function signInAnon(): Promise<User> {
    setLoading(true);

    const cred = await signInAnonymously(auth);

    return cred.user;
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInAnon }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve estar dentro do AuthProvider");
  }
  return ctx;
}
