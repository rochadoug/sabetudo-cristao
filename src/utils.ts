//import {LOCAL_STORAGE_GUEST_KEY} from "./contexts/AuthContext";
import type { GameUserData } from "./contexts/AuthContext";

export function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export function shuffle<T>(array: T[]) {
  return [...array].sort(() => Math.random() - 0.5);
}


// 🔹 Funções de utilidade para Criptografia/Codificação Base64
export function encodeGuestData(data: GameUserData): string {
    const jsonString = JSON.stringify(data);
    return btoa(unescape(encodeURIComponent(jsonString)));
}

export function decodeGuestData(encoded: string): GameUserData | null {
    try {
        const decodedString = decodeURIComponent(escape(atob(encoded)));
        return JSON.parse(decodedString) as GameUserData;
    } catch (err) {
        console.error("Erro ao decodificar dados locais corrompidos:", err);
        return null;
    }
}
