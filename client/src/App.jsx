import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import { ContextProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'sonner';
import './index.css';

const App = () => {
    return (
        <ThemeProvider>
            <ContextProvider>
                <Toaster position="top-right" richColors closeButton />
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Dashboard />} />
                    <Route path="/message" element={<Dashboard />} />
                    <Route path="/notification" element={<Dashboard />} />
                    <Route path="/profile" element={<Dashboard />} />
                    <Route path="/settings" element={<Dashboard />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Router>
            </ContextProvider>
        </ThemeProvider>
    );
};

export default App;
