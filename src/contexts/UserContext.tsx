import { createContext, useContext, useEffect, useState, useRef } from "react";
import { doc, FieldValue, getDoc, serverTimestamp, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { collection, getCountFromServer, query, where } from "firebase/firestore";
import { useAuth } from "./AuthContext";




// 🔹 Tipagem do usuário
export type UserData = {
    uid: string;
    name: string;
    gold: number;
    oil: number;
    menorahLit: number;
    totalCorrect: number;
    answeredQuestions: string[];
    lastAnswerDate: string;
    createdAt: Timestamp | FieldValue;
};

// 🔹 Funções expostas
type UserContextType = {
    user: UserData | null;
    rank: number | null;
    loading: boolean;
    rewardGold: () => void;
    lightMenorah: () => void;
    registerCorrectAnswer: (questionId: string) => number;
    buyOil: (amount?: number) => boolean;
};

export const GOLD_EVERY = 3; // a cada 2 acertos → +1 ouro
export const GOLD_REWARD = 1; // a cada 5 acertos → +1 ouro
export const GOLD_PER_OIL = 144;
export const OIL_PER_LAMP = 3;

const UserContext = createContext<UserContextType | null>(null);

// 🔥 Provider
export function UserProvider({ children, }: { children: React.ReactNode; }) {
    const { user: authUser, loading: authLoading } = useAuth();
    const uid = authUser?.uid;

    const cachedUser = localStorage.getItem("user_snapshot");
    const [user, setUser] = useState<UserData | null>(
        cachedUser ? JSON.parse(cachedUser) : null
    );

    const [loading, setLoading] = useState(true);
    const [rank, setRank] = useState<number | null>(null);
    const [correctCount, setCorrectCount] = useState(0);
    const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // TODO: offline-first real
    // - persist user state in IndexedDB
    // - sync queued mutations when online
    // cache do usuario
    useEffect(() => {
        if (user) {
            localStorage.setItem("user_snapshot", JSON.stringify(user));
        }
    }, [user]);

    // 🔹 Carrega usuário do Firestore
    useEffect(() => {
        if (!uid) return;

        const userId = uid;

        async function loadUser() {
            const ref = doc(db, "users", userId);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                setUser(snap.data() as UserData);
            } else {
                const newUser: UserData = {
                    uid: userId,
                    name: "Convidado",
                    gold: 0,
                    oil: 0,
                    menorahLit: 0,
                    totalCorrect: 0,
                    answeredQuestions: [],
                    lastAnswerDate: new Date().toISOString().slice(0, 10),
                    createdAt: serverTimestamp(),
                };

                await setDoc(ref, newUser);
                setUser(newUser);
            }

            setLoading(false);
        }

        loadUser();
    }, [uid]);

    useEffect(() => {
        if (!user) return;

        getUserRank(user).then(setRank);
    }, [user?.gold, user?.oil, user?.menorahLit]);

    //Salvar na db ao sair
    useEffect(() => {
        function flushOnUnload() {
            if (!user) return;

            updateDoc(doc(db, "users", user.uid), {
                totalCorrect: user.totalCorrect,
                gold: user.gold,
                oil: user.oil,
                menorahLit: user.menorahLit,
                answeredQuestions: user.answeredQuestions,
                lastAnswerDate: user.lastAnswerDate,
            });
        }

        window.addEventListener("beforeunload", flushOnUnload);
        return () => window.removeEventListener("beforeunload", flushOnUnload);
    }, [user]);


    //Salvar na db
    function scheduleSave(updated: UserData) {
        if (saveTimeout.current) {
            clearTimeout(saveTimeout.current);
        }

        saveTimeout.current = setTimeout(() => {
            updateDoc(doc(db, "users", updated.uid), {
                totalCorrect: updated.totalCorrect,
                gold: updated.gold,
                oil: updated.oil,
                menorahLit: updated.menorahLit,
                answeredQuestions: updated.answeredQuestions,
                lastAnswerDate: updated.lastAnswerDate,
            });

            saveTimeout.current = null;
        }, 7000); // 7s sem mudanças
    }

    // 🔥 Helpers de atualização (estado + firestore)

    function rewardGold() {
        if (!user) return false;

        if (user.gold < 0) {
            return false;
        }

        setCorrectCount(cr => cr + 1)
        if (correctCount >= GOLD_EVERY) {
            const updated = {
                ...user,
                gold: user.gold + GOLD_REWARD,
            };

            setUser(updated);

            updateDoc(doc(db, "users", user.uid), {
                gold: updated.gold,
            });
            setCorrectCount(0);
        }


        return correctCount;
    }

    function buyOil(amount: number = 1) {
        if (!user) return false;

        const cost = amount * GOLD_PER_OIL;

        if (user.gold < cost) {
            return false;
        }

        const updated = {
            ...user,
            gold: user.gold - cost,
            oil: user.oil + amount,
        };

        setUser(updated);

        updateDoc(doc(db, "users", user.uid), {
            gold: updated.gold,
            oil: updated.oil,
        });

        return true;
    }

    function lightMenorah() {
        if (!user) return false;

        if (user.oil < OIL_PER_LAMP) return false;
        if (user.menorahLit >= 7) return false;

        const updated = {
            ...user,
            oil: user.oil - OIL_PER_LAMP,
            menorahLit: user.menorahLit + 1,
        };

        setUser(updated);

        updateDoc(doc(db, "users", user.uid), {
            oil: updated.oil,
            menorahLit: updated.menorahLit,
        });

        return true;
    }


    function registerCorrectAnswer(questionId: string) {
        if (!user) return 0;

        const today = new Date().toISOString().slice(0, 10);

        // 🔁 novo dia → reset
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

        // regra de ouro
        if (newTotalCorrect % GOLD_EVERY === 0 && !isRepeated) {
            calcGold = GOLD_REWARD;
            newGold += GOLD_REWARD;
        }

        const updates: Partial<UserData> = {
            totalCorrect: newTotalCorrect,
            answeredQuestions: answeredToday,
            lastAnswerDate: today,
            gold: newGold,
        };

        const updatedUser = {
            ...user,
            ...updates,
        };

        setUser(updatedUser);
        scheduleSave(updatedUser);
        //updateDoc(doc(db, "users", user.uid), updates);

        return calcGold;
    }

    if (authLoading || loading) {
        return <p>Carregando usuário...</p>;
    }

    return (
        <UserContext.Provider
            value={{
                user,
                rank,
                loading,
                rewardGold,
                lightMenorah,
                registerCorrectAnswer,
                buyOil,
            }}
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

async function getUserRank(user: UserData) {
    const usersRef = collection(db, "users");

    // 1️⃣ usuários com mais menorás
    const q1 = query(
        usersRef,
        where("menorahLit", ">", user.menorahLit)
    );

    // 2️⃣ mesma menorá, mais azeite
    const q2 = query(
        usersRef,
        where("menorahLit", "==", user.menorahLit),
        where("oil", ">", user.oil)
    );

    // 3️⃣ mesma menorá e azeite, mais ouro
    const q3 = query(
        usersRef,
        where("menorahLit", "==", user.menorahLit),
        where("oil", "==", user.oil),
        where("gold", ">", user.gold)
    );

    const [c1, c2, c3] = await Promise.all([
        getCountFromServer(q1),
        getCountFromServer(q2),
        getCountFromServer(q3),
    ]);

    return (
        c1.data().count +
        c2.data().count +
        c3.data().count +
        1
    );
}
