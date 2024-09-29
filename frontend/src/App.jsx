import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage.jsx';
import Registro from './components/Registro/Registro.jsx';
import Login from './components/Login/Login.jsx';
import Verificacao from './components/Verificacao/Verificacao.jsx';
import Usuario from './components/Usuario/Usuario.jsx';
import DownloadPage from './components/DownloadPage/Download.jsx';
import PrivacyPage from './components/PrivacyPage/PrivacyPage.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verificacao" element={<Verificacao />} />
        <Route path="/usuario" element={<Usuario />} />
        <Route path="/download" element={<DownloadPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        {/* Outras rotas aqui */}
      </Routes>
    </Router>
  );
}

export default App;
