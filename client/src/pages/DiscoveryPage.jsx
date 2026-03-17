import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, User, Star, Loader2, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';
import { SocketContext } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { fetchData } from '../services/api';
import CallOverlay from '../components/call/CallOverlay';
import Sidebar from '../components/ui/Sidebar';

const DiscoveryPage = () => {
    const { user, socket } = useContext(SocketContext);
    const navigate = useNavigate();
    const [discoverUsers, setDiscoverUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sendingId, setSendingId] = useState(null);
    const [sentIds, setSentIds] = useState([]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchDiscoverUsers();
    }, [user, navigate]);

    const fetchDiscoverUsers = async () => {
        if (!user?.id) return;
        setLoading(true);
        const { ok, data } = await fetchData(`/api/connections/discover/${user.id}`);
        if (ok) {
            const users = Array.isArray(data) ? data : [];
            setDiscoverUsers(users);
            const alreadySent = users.filter(u => u.connectionStatus === 'sent').map(u => u._id);
            setSentIds(alreadySent);
        }
        setLoading(false);
    };

    const handleSendRequest = async (recipientId) => {
        setSendingId(recipientId);
        const { ok, data } = await fetchData('/api/connections/request', {
            method: 'POST',
            body: JSON.stringify({ requesterId: user.id, recipientId })
        });
        
        if (ok) {
            toast.success(data.message);
            setSentIds(prev => [...prev, recipientId]);
            socket.emit('send-friend-request', { recipientId, requesterName: user.username });
        }
        setSendingId(null);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5 } }
    };

    return (
        <motion.div 
            className="home-container"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <Sidebar />

            <div style={{ flex: 1, padding: 'clamp(1rem, 5vw, 2.5rem)', height: '100%', overflowY: 'auto', background: 'var(--bg-app)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ marginBottom: 'clamp(1.5rem, 5vw, 3rem)' }}>
                        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>Discover New People ✨</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(1rem, 2vw, 1.25rem)', marginTop: '0.75rem', fontWeight: 500 }}>Expand your network and find connection in real-time.</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <Sparkles size={24} color="var(--accent)" />
                        <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Recommendations for you</h2>
                    </div>

                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
                            <Loader2 className="animate-spin" size={48} color="var(--accent)" />
                        </div>
                    ) : (
                        <div className="discovery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2.5rem' }}>
                            <AnimatePresence>
                                {discoverUsers.map((stranger) => (
                                    <motion.div 
                                        key={stranger._id}
                                        layout
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="section-card"
                                        style={{ 
                                            borderRadius: '32px', 
                                            padding: '1.25rem', 
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '1.25rem',
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--bg-input)',
                                            height: '100%'
                                        }}
                                    >
                                        <div style={{ 
                                            height: '240px', 
                                            borderRadius: '24px', 
                                            overflow: 'hidden',
                                            background: 'var(--bg-app)',
                                            position: 'relative'
                                        }}>
                                            {stranger.profileImage ? (
                                                <img src={stranger.profileImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={stranger.username} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1, color: 'var(--text-main)' }}>
                                                    <User size={80} />
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ padding: '0 0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
                                                    {stranger.username}
                                                </h3>
                                                <div style={{ background: 'var(--accent)', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Check size={16} strokeWidth={3} />
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                                                {stranger.age && <p style={{ margin: 0 }}><strong>Age:</strong> {stranger.age}</p>}
                                                {stranger.location && <p style={{ margin: 0 }}><strong>Location:</strong> {stranger.location}</p>}
                                                {stranger.bio && (
                                                    <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                        {stranger.bio}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 'auto' }}>
                                            <motion.button 
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleSendRequest(stranger._id)}
                                                disabled={sendingId === stranger._id || sentIds.includes(stranger._id)}
                                                style={{ 
                                                    flex: 1,
                                                    background: sentIds.includes(stranger._id) ? '#22c55e' : 'var(--accent)', 
                                                    color: 'white', 
                                                    border: 'none', 
                                                    padding: '14px', 
                                                    borderRadius: '16px', 
                                                    fontWeight: 800,
                                                    fontSize: '1rem',
                                                    cursor: sentIds.includes(stranger._id) ? 'default' : 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '10px'
                                                }}
                                            >
                                                {sendingId === stranger._id ? (
                                                    <Loader2 className="animate-spin" size={20} />
                                                ) : sentIds.includes(stranger._id) ? (
                                                    <>
                                                        <Check size={20} />
                                                        Request Sent
                                                    </>
                                                ) : (
                                                    'Add Friend'
                                                )}
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {!loading && discoverUsers.length === 0 && (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '6rem 0', color: 'var(--text-muted)' }}>
                                    <div style={{ background: 'var(--bg-card)', width: '100px', height: '100px', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto', opacity: 0.3 }}>
                                        <Zap size={64} />
                                    </div>
                                    <h2 style={{ color: 'var(--text-main)', fontWeight: 800 }}>No more recommendations</h2>
                                    <p style={{ fontSize: '1.1rem' }}>We've shown you everyone new for today. Check back tomorrow for more!</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Premium Section Link */}
                    <div style={{ 
                        marginTop: '6rem', 
                        padding: 'clamp(2rem, 10vw, 4rem)', 
                        background: 'linear-gradient(135deg, var(--accent) 0%, #6366f1 100%)', 
                        borderRadius: '40px', 
                        color: 'white', 
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ background: 'rgba(255,255,255,0.2)', width: '70px', height: '70px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto' }}>
                                <Star size={40} fill="white" />
                            </div>
                            <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 900, marginBottom: '1rem' }}>Nexus Premium</h2>
                            <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>Stand out with a special badge, unlock custom themes, and see who viewed your profile.</p>
                            <button style={{ background: 'white', color: 'var(--accent)', border: 'none', padding: '16px 40px', borderRadius: '16px', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer' }}>Unlock Everything</button>
                        </div>
                        {/* Decorative background elements */}
                        <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                    </div>
                </div>
            </div>

            <CallOverlay />
        </motion.div>
    );
};

export default DiscoveryPage;
