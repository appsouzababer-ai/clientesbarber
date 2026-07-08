import React from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import LoginPage from './pages/LoginPage';
import CadastroPage from './pages/CadastroPage';
import UserAreaPage from './pages/UserAreaPage';
import AgendarPage from './pages/AgendarPage';
import MeusAgendamentosPage from './pages/MeusAgendamentosPage';
import AdminPage from './pages/AdminPage';
import { getCliente } from '@/lib/barber';

function RequireClient({ children }) {
    return getCliente() ? children : <Navigate to="/" replace />;
}

function App() {
    return (
        <Router>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/cadastro" element={<CadastroPage />} />
                <Route path="/app" element={<RequireClient><UserAreaPage /></RequireClient>} />
                <Route path="/agendar" element={<RequireClient><AgendarPage /></RequireClient>} />
                <Route path="/meus-agendamentos" element={<RequireClient><MeusAgendamentosPage /></RequireClient>} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
