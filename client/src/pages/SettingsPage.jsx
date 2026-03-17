import React, { useEffect, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import ProfileSettings from '../components/profile/ProfileSettings';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import CallOverlay from '../components/call/CallOverlay';
import Sidebar from '../components/ui/Sidebar';

const SettingsPage = () => {
    const { user } = useContext(SocketContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
    }, [user, navigate]);

    return (
        <motion.div 
            className="home-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <Sidebar />

            <div className="main-viewport" style={{ flex: 1, padding: 'clamp(1rem, 5vw, 2.5rem)', height: '100%', overflowY: 'auto' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3.5rem' }}>
                        <button 
                            onClick={() => navigate(-1)}
                            style={{ 
                                border: 'none', color: 'var(--text-main)', 
                                cursor: 'pointer', padding: '10px', borderRadius: '14px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: '0.2s', background: 'var(--accent-light)'
                            }}
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 850, margin: 0, letterSpacing: '-1.5px' }}>Account Settings</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>Customize your account, theme, and profile details.</p>
                        </div>
                    </div>

                    <div className="section-card" style={{ padding: '2.5rem', marginBottom: '2rem', borderRadius: '32px' }}>
                        <ProfileSettings onClose={() => navigate('/profile')} />
                    </div>
                </div>
            </div>

            <CallOverlay />
        </motion.div>
    );
};

export default SettingsPage;
