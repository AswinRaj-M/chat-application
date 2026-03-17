import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ContextProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'sonner';

// Pages
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import DiscoveryPage from './pages/DiscoveryPage';
import NotificationPage from './pages/NotificationPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

// Components
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';

import './index.css';

const App = () => {
    return (
        <ThemeProvider>
            <ContextProvider>
                <Toaster position="top-right" richColors closeButton />
                <Router>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />

                        {/* App Routes */}
                        <Route path="/home" element={<DiscoveryPage />} />
                        <Route path="/chat" element={<ChatPage />} />
                        <Route path="/message" element={<Navigate to="/chat" replace />} />
                        <Route path="/notifications" element={<NotificationPage />} />
                        <Route path="/notification" element={<Navigate to="/notifications" replace />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/settings" element={<SettingsPage />} />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </Router>
            </ContextProvider>
        </ThemeProvider>
    );
};

export default App;
