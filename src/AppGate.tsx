import { useAuth } from "./contexts/AuthContext";
import { UserProvider } from "./contexts/UserContext";
import LoginPage from "./pages/LoginPage";
import AppRoutes from "./routes/AppRoutes";

export default function AppGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Carregando...</p>;
  }

  return user
  ? (
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    )
  : <LoginPage />;
}