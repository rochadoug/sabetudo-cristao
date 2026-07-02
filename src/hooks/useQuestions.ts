import { useEffect, useRef, useState } from "react";
import { collection, getDocs, limit, orderBy, query, QueryDocumentSnapshot, startAfter, where, type DocumentData } from "firebase/firestore";
import { db } from "../services/firebase";
import type { UserData } from "../contexts/UserContext";


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


export function useQuestions(user?: UserData | null) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);

  useEffect(() => {

    async function loadQuestions() {

      if(!user) return;
      
      let pool: Question[] = [];

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
      })

      setQuestions(pool.slice(0, 15));
      setLoading(false);
    }

    loadQuestions();

  }, []);
  /* useEffect(() => {
    async function loadQuestions() {

      try {
        setLoading(true);

        const today = new Date().toISOString().slice(0, 10);

        const randStart = Math.floor(Math.random()*3+1);
        console.log("RandStart: ",randStart)
        //  Busca perguntas aprovadas (Firestore já usa cache local automaticamente)
        const q = query(
          collection(db, "questions"),
          where("status", "==", "approved"),
          orderBy('level','asc'),
          startAt(randStart),
          limit(20)
        );

        const snap = await getDocs(q);

        const allQuestions: Question[] = snap.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Question, "id">),
        }));

        //  Perguntas já respondidas hoje
        const answeredToday =
          user?.lastAnswerDate === today
            ? user.answeredQuestions ?? []
            : [];

        console.log("All Questions", allQuestions)
        // 🚫 Remove respondidas hoje
        let pool = allQuestions.filter(
          q => !answeredToday.includes(q.id)
        );


        if (pool.length === 0) {
          pool = allQuestions;
        }
        console.log("Pool ", pool)
        // 🎚️ Separa por nível
        const easy = shuffle(
          pool.filter(q => q.level === QUESTION_LEVEL.EASY)
        ).slice(0, 5);

        const medium = shuffle(
          pool.filter(q => q.level === QUESTION_LEVEL.MEDIUM)
        ).slice(0, 5);

        const hard = shuffle(
          pool.filter(q => q.level === QUESTION_LEVEL.HARD)
        ).slice(0, 5);

        // 🎯 Monta bloco final
        const dailyBlock = shuffle([...easy, ...medium, ...hard]).map(q => {
          const safeAnswers = Array.isArray(q.answers)
            ? q.answers
            : [
              { text: "resposta1", correct: true },
              { text: "resposta2", correct: false },
              { text: "resposta3", correct: false },
              { text: "resposta4", correct: false },
            ];

          return {
            ...q,
            answers: shuffle([...safeAnswers]),
          };
        });

        pool.map(q => {
          return {
            ...q,
            answers: shuffleArray([...q.answers]),
          };
        })
        console.log("Daily: ",dailyBlock.length)
        console.log("poolLength: ",pool.length)
        //setQuestions(dailyBlock);
        setQuestions(pool);
      } catch (err) {
        console.error("Erro ao carregar perguntas:", err);

      } finally {
        setLoading(false);
      }

    }

    loadQuestions();
  }, [user?.lastAnswerDate]); */

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