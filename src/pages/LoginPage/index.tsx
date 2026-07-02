import { useState } from 'react';
import './styles.css';
import Logo from '../../components/Logo';
import { db } from '../../services/firebase';
import {
  /*   collection,
    getDocs,
    query,
    where, */
  setDoc,
  doc,
} from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile } from 'firebase/auth';

function LoginPage() {
  const [mode, setMode] = useState<'login' | 'guest'>('guest');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signInAnon } = useAuth();

  async function handleGuestLogin() {
    if (!name.trim()) {
      setError('Informe um nome');
      return;
    }

    setLoading(true);
    setError('');

    try {


      // auth anônimo
      const user = await signInAnon();
      const uid = user.uid;

      await updateProfile(user, {
        displayName: name.trim()
      });
      
      // cria usuário no firestore
      await setDoc(doc(db, 'users', uid), {
        uid,
        name: name.trim(),
        gold: 0,
        oil: 0,
        menorahLit: 0,
        totalCorrect: 0,
        answeredQuestions: [],
        lastAnswerDate: new Date().toISOString().slice(0, 10),
        createdAt: new Date(),
      });

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
