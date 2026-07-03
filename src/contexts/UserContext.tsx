import { createContext, useContext, useEffect, useState, useRef } from "react";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { collection, getCountFromServer, query, where } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import type { GameUserData } from "./AuthContext";

// 🔹 Funções expostas
type UserContextType = {
    user: GameUserData | null; // Atualizado para usar o tipo unificado
    rank: number | null;
    loading: boolean;
    rewardGold: () => void;
    lightMenorah: () => void;
    registerCorrectAnswer: (questionId: string) => number;
    buyOil: (amount?: number) => boolean;
};

export const GOLD_EVERY = 3;
export const GOLD_REWARD = 1;
export const GOLD_PER_OIL = 144;
export const OIL_PER_LAMP = 3;

const UserContext = createContext<UserContextType | null>(null);

// 🔥 Provider
export function UserProvider({ children }: { children: React.ReactNode }) {
    const { user: authUser, loading: authLoading } = useAuth();

    // Estado central do usuário. Iniciamos com null.
    const [user, setUser] = useState<GameUserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [rank, setRank] = useState<number | null>(null);
    const [correctCount, setCorrectCount] = useState(0);
    const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 🔹 Carrega usuário (Local ou Firestore)
    useEffect(() => {
        if (authLoading) return; // Espera o Auth resolver

        if (!authUser) {
            setUser(null);
            setLoading(false);
            return;
        }

        async function loadUser() {
             if (!authUser) {
            setUser(null);
            setLoading(false);
            return;
        }
            // Se for convidado local, ele já vem pronto do AuthContext
            if (authUser.isGuest) {
                setUser(authUser);
                setLoading(false);
                return;
            }

            // Se for conta permanente, busca do Firestore
            const ref = doc(db, "users", authUser.uid);
            try {
                const snap = await getDoc(ref);

                if (snap.exists()) {
                    setUser({ ...snap.data(), isGuest: false } as GameUserData);
                } else {
                    // Cria usuário novo no Firestore caso não exista
                    const newUser: GameUserData = {
                        uid: authUser.uid,
                        name: authUser.name,
                        gold: 0,
                        oil: 0,
                        menorahLit: 0,
                        totalCorrect: 0,
                        answeredQuestions: [],
                        lastAnswerDate: new Date().toISOString().slice(0, 10),
                        createdAt: new Date().toISOString(), // Usando string para consistência com local
                        isGuest: false,
                    };
                    await setDoc(ref, { ...newUser, createdAt: serverTimestamp() });
                    setUser(newUser);
                }
            } catch (err) {
                console.error("Erro ao buscar usuário do Firestore:", err);
            }
            setLoading(false);
        }

        loadUser();
    }, [authUser, authLoading]);

    // 🔹 Atualiza Ranking apenas para usuários reais (Convidados ficam sem rank global)
    useEffect(() => {
        if (!user || user.isGuest) {
            setRank(null);
            return;
        }

        getUserRank(user).then(setRank).catch(console.error);
    }, [user?.gold, user?.oil, user?.menorahLit, user?.isGuest]);

    // 🔹 Helper universal para salvar dados (Local ou Firestore)
    function persistUserData(updatedUser: GameUserData) {
        setUser(updatedUser);

        if (updatedUser.isGuest) {
            // Salva o convidado apenas no localStorage (substituindo o antigo "user_snapshot" e usando a chave oficial)
            localStorage.setItem("@SabeTudoCristao:guest", JSON.stringify(updatedUser));
        } else {
            // Se for real, agenda o salvamento no Firestore
            scheduleSave(updatedUser);
        }
    }

    // Salvar no banco (apenas contas reais)
    function scheduleSave(updated: GameUserData) {
        if (updated.isGuest) return;

        if (saveTimeout.current) clearTimeout(saveTimeout.current);

        saveTimeout.current = setTimeout(() => {
            updateDoc(doc(db, "users", updated.uid), {
                totalCorrect: updated.totalCorrect,
                gold: updated.gold,
                oil: updated.oil,
                menorahLit: updated.menorahLit,
                answeredQuestions: updated.answeredQuestions,
                lastAnswerDate: updated.lastAnswerDate,
            }).catch(console.error);

            saveTimeout.current = null;
        }, 7000); // 7s sem mudanças
    }

    // 🔥 Helpers de atualização de jogo

    function rewardGold() {
        if (!user) return false;
        if (user.gold < 0) return false;

        setCorrectCount(cr => cr + 1);
        if (correctCount >= GOLD_EVERY - 1) { // Ajuste fino da lógica antiga
            const updated = { ...user, gold: user.gold + GOLD_REWARD };
            persistUserData(updated);
            setCorrectCount(0);
        }
        return correctCount;
    }

    function buyOil(amount: number = 1) {
        if (!user) return false;

        const cost = amount * GOLD_PER_OIL;
        if (user.gold < cost) return false;

        const updated = { ...user, gold: user.gold - cost, oil: user.oil + amount };
        persistUserData(updated);
        return true;
    }

    function lightMenorah() {
        if (!user) return false;
        if (user.oil < OIL_PER_LAMP) return false;
        if (user.menorahLit >= 7) return false;

        const updated = { ...user, oil: user.oil - OIL_PER_LAMP, menorahLit: user.menorahLit + 1 };
        persistUserData(updated);
        return true;
    }

    function registerCorrectAnswer(questionId: string) {
        if (!user) return 0;

        const today = new Date().toISOString().slice(0, 10);
        let answeredToday = [...user.answeredQuestions];

        if (user.lastAnswerDate !== today) {
            answeredToday = [];
        }

        const isRepeated = answeredToday.includes(questionId);
        const newTotalCorrect = user.totalCorrect + 1;
        let newGold = user.gold;
        let calcGold = 0;

        if (!isRepeated) {
            answeredToday = [...answeredToday, questionId];
        }

        if (newTotalCorrect % GOLD_EVERY === 0 && !isRepeated) {
            calcGold = GOLD_REWARD;
            newGold += GOLD_REWARD;
        }

        const updatedUser = {
            ...user,
            totalCorrect: newTotalCorrect,
            answeredQuestions: answeredToday,
            lastAnswerDate: today,
            gold: newGold,
        };

        persistUserData(updatedUser);
        return calcGold;
    }

    if (authLoading || loading) {
        return <p>Carregando usuário...</p>; // Ou o seu componente de Loading visual
    }

    return (
        <UserContext.Provider
            value={{ user, rank, loading, rewardGold, lightMenorah, registerCorrectAnswer, buyOil }}
        >
            {children}
        </UserContext.Provider>
    );
}

// 🔹 Hook
export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) {
        throw new Error("useUser deve estar dentro do UserProvider");
    }
    return ctx;
}

async function getUserRank(user: GameUserData) {
    if (user.isGuest) return null; // Prevenção dupla

    const usersRef = collection(db, "users");

    const q1 = query(usersRef, where("menorahLit", ">", user.menorahLit));
    const q2 = query(usersRef, where("menorahLit", "==", user.menorahLit), where("oil", ">", user.oil));
    const q3 = query(usersRef, where("menorahLit", "==", user.menorahLit), where("oil", "==", user.oil), where("gold", ">", user.gold));

    const [c1, c2, c3] = await Promise.all([
        getCountFromServer(q1),
        getCountFromServer(q2),
        getCountFromServer(q3),
    ]);

    return c1.data().count + c2.data().count + c3.data().count + 1;
}