import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { useAuth } from './hooks/useAuth.js';
import HomePage from './components/HomePage/HomePage.jsx';
import Registro from './components/Registro/Registro.jsx';
import Login from './components/Login/Login.jsx';
import Verificacao from './components/Verificacao/Verificacao.jsx';
import Usuario from './components/Usuario/Usuario.jsx';
import DownloadPage from './components/DownloadPage/Download.jsx';
import PrivacyPage from './components/PrivacyPage/PrivacyPage.jsx';

// Protege rotas que exigem sessão: sem usuário vai para o registro,
// com email não verificado vai para a verificação.
function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/registro" replace />;
  if (!user.emailVerified) return <Navigate to="/verificacao" replace />;

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verificacao" element={<Verificacao />} />
          <Route
            path="/usuario"
            element={
              <RequireAuth>
                <Usuario />
              </RequireAuth>
            }
          />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
