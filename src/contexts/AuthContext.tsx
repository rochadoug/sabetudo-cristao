import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../services/auth";
import { encodeGuestData, decodeGuestData } from "../utils";

export const LOCAL_STORAGE_GUEST_KEY = '@SabeTudoCristao:guest';

// Tipagem para as estatísticas do jogo do usuário
export type GameUserData = {
  uid: string;
  name: string;
  gold: number;
  oil: number;
  menorahLit: number;
  totalCorrect: number;
  answeredQuestions: string[];
  lastAnswerDate: string;
  createdAt: string;
  isGuest: boolean;
};

type AuthContextType = {
  user: GameUserData | null;
  loading: boolean;
  loginAsGuestLocal: (guestData: GameUserData) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<GameUserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Primeiro, checa se existe um Convidado salvo localmente
    const localGuest = localStorage.getItem(LOCAL_STORAGE_GUEST_KEY);

    if (localGuest) {
      // 🔒 Decodifica a string misteriosa de volta para objeto usando seu helper
      const decoded = decodeGuestData(localGuest);
      
      if (decoded) {
        setUser(decoded);
      } else {
        // Se os dados estiverem corrompidos/alterados, limpa para evitar quebras
        localStorage.removeItem(LOCAL_STORAGE_GUEST_KEY);
        setUser(null);
      }
      setLoading(false);
    } else {
      // 2. Se não houver convidado, ouve o Firebase Auth (para futuras contas reais)
      const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Quando você implementar a conta real, aqui você buscará 
          // os dados do Firestore usando o firebaseUser.uid.
          // Por enquanto, montamos um objeto compatível:
          setUser({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || "Usuário",
            gold: 0,
            oil: 0,
            menorahLit: 0,
            totalCorrect: 0,
            answeredQuestions: [],
            lastAnswerDate: new Date().toISOString().slice(0, 10),
            createdAt: new Date().toISOString(),
            isGuest: false,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => unsub();
    }
  }, []);

  // Nova função para salvar o convidado localmente
  function loginAsGuestLocal(guestData: GameUserData) {
    try {
      // 🔒 Codifica antes de salvar
      const secretString = encodeGuestData(guestData);
      localStorage.setItem(LOCAL_STORAGE_GUEST_KEY, secretString);
      setUser(guestData);
    } catch (err) {
      console.error("Erro ao salvar convidado localmente:", err);
    }
  }

  // Função de logout atualizada para limpar ambos os estados
  async function logout() {
    setLoading(true);
    localStorage.removeItem("@SabeTudoCristao:guest");
    await signOut(auth);
    setUser(null);
    setLoading(false);
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginAsGuestLocal, logout }}>
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