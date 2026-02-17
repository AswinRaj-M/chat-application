import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import { ContextProvider } from './context/SocketContext';
import './index.css';

const App = () => {
    return (
        <ContextProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Home />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Router>
        </ContextProvider>
    );
};

export default App;
