import { useEffect, useRef, useState } from "react";
import { collection, getDocs, limit, orderBy, query, QueryDocumentSnapshot, startAfter, where, type DocumentData } from "firebase/firestore";
import { db } from "../services/firebase";
import type { GameUserData } from "../contexts/AuthContext"; // Importação atualizada e segura para o TS

export const QUESTION_LEVEL = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3
} as const;

export type QuestionLevel =
  (typeof QUESTION_LEVEL)[keyof typeof QUESTION_LEVEL];

export type Answer = {
  text: string;
  correct: boolean;
};

export type Question = {
  id: string;
  text: string;
  answers: Answer[];
  level: QuestionLevel;
  status: "approved" | "rejected" | "pending";
  verse?: string;
};

export function useQuestions(user?: GameUserData | null) { // Tipo atualizado aqui
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);

  useEffect(() => {
    async function loadQuestions() {
      if (!user) return;
      
      let pool: Question[] = [];

      try {
        while (pool.length < 15) {
          const q = query(
            collection(db, "questions"),
            where("status", "==", "approved"),
            orderBy("level", "asc"),
            ...(lastDocRef.current ? [startAfter(lastDocRef.current)] : []),
            limit(20)
          );

          const snap = await getDocs(q);

          if (snap.empty) break;

          lastDocRef.current = snap.docs[snap.docs.length - 1];

          const batch: Question[] = snap.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as Omit<Question, "id">)
          }));

          const filtered = batch.filter(
            q => !user?.answeredQuestions.includes(q.id)
          );

          pool.push(...filtered);
        }

        pool = pool.map(q => {
          return {
            ...q,
            answers: shuffle(q.answers),
          };
        });

        setQuestions(pool.slice(0, 15));
      } catch (err) {
        console.error("Erro ao carregar perguntas do Firestore:", err);
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [user?.uid]); // Alterado para disparar com base no ID único do usuário, garantindo estabilidade

  return { questions, loading };
}

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}