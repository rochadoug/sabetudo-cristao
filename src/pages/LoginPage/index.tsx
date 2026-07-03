import { useState } from 'react';
import './styles.css';
import Logo from '../../components/Logo';
import { useAuth } from '../../contexts/AuthContext';

function LoginPage() {
  const [mode, setMode] = useState<'login' | 'guest'>('guest');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pegamos a função de login local do nosso contexto (vamos criá-la/ajustá-la no AuthContext)
  const { loginAsGuestLocal } = useAuth();

  async function handleGuestLogin() {
    if (!name.trim()) {
      setError('Informe um nome');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Criamos a mesma estrutura de dados que ia para o Firestore, mas agora localmente
      const guestUid = `guest_${Date.now()}`;
      const guestData = {
        uid: guestUid,
        name: name.trim(),
        gold: 0,
        oil: 0,
        menorahLit: 0,
        totalCorrect: 0,
        answeredQuestions: [],
        lastAnswerDate: new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString(),
        isGuest: true // Flag crucial para sabermos que não está no Firebase ainda
      };

      // 2. Chamamos a função do contexto para salvar e atualizar o estado global do app
      loginAsGuestLocal(guestData);

    } catch (err) {
      console.error(err);
      setError('Erro ao entrar como convidado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <Logo mclass="logo" />

      <div className="login-card">
        {mode === 'guest' && (
          <>
            <p>Entrar como convidado</p>

            <input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
            />

            {error && <span className="error">{error}</span>}

            <button onClick={handleGuestLogin} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <button
              className="guest"
              onClick={() => setMode('login')}
              disabled
            >
              Conta permanente
            </button>
          </>
        )}

        {mode === 'login' && (
          <>
            <p>Entre para continuar</p>

            <input type="email" placeholder="Email" disabled />
            <input type="password" placeholder="Senha" disabled />

            <button disabled>Entrar</button>

            <button
              className="guest"
              onClick={() => setMode('guest')}
            >
              Continuar como convidado
            </button>
          </>
        )}
      </div>
    </main>
  );
}

export default LoginPage;