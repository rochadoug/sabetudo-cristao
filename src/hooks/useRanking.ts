import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  limit
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useUser } from "../contexts/UserContext";

export type RankingUser = {
  uid: string;
  name: string;
  gold: number;
  oil: number;
  menorahLit: number;
};

type RankingUserWithMeta = RankingUser & {
  position: number;
  isMe: boolean;
};

export function useRanking() {
  const { user } = useUser();

  const [ranking, setRanking] = useState<RankingUserWithMeta[]>([]);
  const [me, setMe] = useState<RankingUserWithMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRanking() {
      setLoading(true);
      try {
        // Reduzimos os orderBys para os 2 principais para evitar a exigência de índices complexos temporariamente,
        // e adicionamos um limite de 50 usuários para poupar leitura do seu banco.
        const q = query(
          collection(db, "users"),
          orderBy("menorahLit", "desc"),
          orderBy("oil", "desc"),
          orderBy("gold", "desc"),
          orderBy("totalCorrect", "desc"),
          limit(50)
        );

        const snap = await getDocs(q);

        const list: RankingUserWithMeta[] = snap.docs.map((doc, index) => {
          const data = doc.data() as RankingUser;

          return {
            ...data,
            uid: doc.id,
            position: index + 1,
            isMe: doc.id === user?.uid,
          };
        });

        setRanking(list);

        // Se for um usuário real, ele se achará na lista
        const currentUser = list.find(u => u.isMe) || null;
        setMe(currentUser);

      } catch (error) {
        console.error("Erro ao carregar ranking do Firestore: ", error);
      } finally {
        setLoading(false);
      }
    }

    // Agora o ranking carrega mesmo se for convidado ou usuário logado
    loadRanking();

  }, [user?.uid]);

  return {
    ranking,
    me,
    loading,
  };
}