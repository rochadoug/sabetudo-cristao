import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";

export async function addDefaultAnswers() {
  const snap = await getDocs(collection(db, "questions"));

  let updated = 0;

  for (const d of snap.docs) {
    const data = d.data();

    // já tem answers? não mexe
    if (Array.isArray(data.answers)) continue;

    const answers = [
      { text: "resposta1", correct: true },
      { text: "resposta2", correct: false },
      { text: "resposta3", correct: false },
      { text: "resposta4", correct: false },
    ];

    await updateDoc(doc(db, "questions", d.id), {
      answers,
    });

    updated++;
    console.log(`✅ answers criado em ${d.id}`);
  }

  console.log(`🎉 Pronto. Total atualizado: ${updated}`);
}
