
import AppGate from './AppGate';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
        <AppGate />
    </AuthProvider>
  );
}
