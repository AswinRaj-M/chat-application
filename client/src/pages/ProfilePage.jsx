import React, { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import FullProfileView from '../components/profile/FullProfileView';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { fetchData } from '../services/api';
import CallOverlay from '../components/call/CallOverlay';
import Sidebar from '../components/ui/Sidebar';

const ProfilePage = () => {
    const { user } = useContext(SocketContext);
    const navigate = useNavigate();
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        const fetchFriends = async () => {
            const { ok, data } = await fetchData(`/api/connections/friends/${user.id}`);
            if (ok) setFriends(data);
        };
        fetchFriends();
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
                <div style={{ maxWidth: '1000px', margin: '0 auto', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
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
                            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 850, margin: 0, letterSpacing: '-1.5px' }}>My Profile</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>View and manage your personal presence on Nexus.</p>
                        </div>
                    </div>

                    <div style={{ height: 'calc(100% - 120px)' }}>
                        <FullProfileView 
                            user={user} 
                            friends={friends} 
                            onEdit={() => navigate('/settings')} 
                        />
                    </div>
                </div>
            </div>

            <CallOverlay />
        </motion.div>
    );
};

export default ProfilePage;
