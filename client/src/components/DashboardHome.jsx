import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, MessageSquare, Bell, User, Star, Heart, MapPin, Loader2, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';

const DashboardHome = ({ user, onNavigate }) => {
    const [discoverUsers, setDiscoverUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sendingId, setSendingId] = useState(null);
    const [sentIds, setSentIds] = useState([]);

    useEffect(() => {
        fetchDiscoverUsers();
    }, [user?.id]);

    const fetchDiscoverUsers = async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/connections/discover/${user.id}`);
            const data = await res.json();
            const users = Array.isArray(data) ? data : [];
            setDiscoverUsers(users);
            
            // Pre-fill sentIds with users who already have a 'sent' status
            const alreadySent = users.filter(u => u.connectionStatus === 'sent').map(u => u._id);
            setSentIds(alreadySent);
        } catch (err) {
            console.error('Failed to fetch discover users', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async (recipientId) => {
        setSendingId(recipientId);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/connections/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requesterId: (user?.id || user?._id), recipientId })
            });
            const data = await res.json();
            
            if (res.ok) {
                toast.success(data.message);
                setSentIds(prev => [...prev, recipientId]);
                // Removed the setTimeout filter - cards now stay until accepted
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error('Connection error');
        } finally {
            setSendingId(null);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="dashboard-home-container"
            style={{ padding: 'clamp(1rem, 5vw, 2rem)', height: '100%', overflowY: 'auto' }}
        >
            <div style={{ marginBottom: 'clamp(1.5rem, 5vw, 3rem)' }}>
                <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 800, margin: 0 }}>Discover New People ✨</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', marginTop: '0.5rem' }}>Send up to 5 requests daily to find your perfect connection.</p>
            </div>

            {/* Discover Feed */}
            <div style={{ marginBottom: '4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <Sparkles size={20} color="var(--accent)" />
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Recommendations for you</h2>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                        <Loader2 className="animate-spin" size={32} color="var(--accent)" />
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2.5rem' }}>
                        <AnimatePresence>
                            {Array.isArray(discoverUsers) && discoverUsers.map((stranger) => (
                                <motion.div 
                                    key={stranger._id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    style={{ 
                                        background: 'var(--bg-card)', 
                                        borderRadius: '40px', 
                                        padding: '20px', 
                                        border: '1px solid var(--bg-input)',
                                        boxShadow: 'var(--shadow-sm)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '15px'
                                    }}
                                >
                                    {/* Profile Image Container */}
                                    <div style={{ 
                                        height: '220px', 
                                        borderRadius: '30px', 
                                        overflow: 'hidden',
                                        background: 'var(--bg-app)',
                                        position: 'relative'
                                    }}>
                                        {stranger.profileImage ? (
                                            <img src={stranger.profileImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                                                <User size={64} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info Section */}
                                    <div style={{ padding: '0 10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                                                {stranger.username}
                                            </h3>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ec4899', borderRadius: '50%', width: '22px', height: '22px', color: 'white' }}>
                                                <Check size={14} strokeWidth={4} />
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', color: 'var(--text-main)', fontSize: '0.85rem' }}>
                                            {stranger.age && <div style={{ fontWeight: 600 }}>Age: <span style={{ fontWeight: 400 }}>{stranger.age}</span></div>}
                                            {stranger.qualification && <div style={{ fontWeight: 600 }}>Qualification: <span style={{ fontWeight: 400 }}>{stranger.qualification}</span></div>}
                                            {stranger.bio && (
                                                <div style={{ marginTop: '8px', color: 'var(--text-muted)', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Bio:</span> {stranger.bio}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Section */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: 'auto', padding: '0 5px' }}>
                                        <motion.button 
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleSendRequest(stranger._id)}
                                            disabled={sendingId === stranger._id || sentIds.includes(stranger._id)}
                                            style={{ 
                                                flex: 1,
                                                background: sentIds.includes(stranger._id) ? '#22c55e' : '#f472b6', 
                                                color: 'white', 
                                                border: 'none', 
                                                height: '50px', 
                                                borderRadius: '25px', 
                                                fontWeight: 800,
                                                fontSize: '1.1rem',
                                                cursor: sentIds.includes(stranger._id) ? 'default' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: '0.3s'
                                            }}
                                        >
                                            {sendingId === stranger._id ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : sentIds.includes(stranger._id) ? (
                                                <>
                                                    <Check size={20} style={{ marginRight: '8px' }} />
                                                    Sent
                                                </>
                                            ) : (
                                                'Connect'
                                            )}
                                        </motion.button>
                                        
                                        <motion.button
                                            whileTap={{ scale: 0.8 }}
                                            style={{ 
                                                background: 'none', 
                                                border: 'none', 
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: 0
                                            }}
                                        >
                                            <Heart size={32} color="var(--text-main)" strokeWidth={1.5} />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {!loading && discoverUsers.length === 0 && (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                <Zap size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
                                <p>No new people found right now. Check back later!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Existing Quick Links */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                <motion.div 
                    whileHover={{ y: -5 }}
                    onClick={() => onNavigate('/message')}
                    className="section-card" 
                    style={{ padding: '2rem', cursor: 'pointer', border: '1px solid var(--bg-input)' }}
                >
                    <div style={{ background: 'var(--accent-light)', color: 'var(--accent)', width: '50px', height: '50px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <MessageSquare size={24} />
                    </div>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>Messages</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Connect with your friends and share your thoughts in real-time.</p>
                </motion.div>

                <motion.div 
                    whileHover={{ y: -5 }}
                    onClick={() => onNavigate('/notification')}
                    className="section-card" 
                    style={{ padding: '2rem', cursor: 'pointer', border: '1px solid var(--bg-input)' }}
                >
                    <div style={{ background: '#fee2e2', color: '#ef4444', width: '50px', height: '50px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <Bell size={24} />
                    </div>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>Notifications</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Stay updated with friend requests and new activities.</p>
                </motion.div>

                <motion.div 
                    whileHover={{ y: -5 }}
                    onClick={() => onNavigate('/profile')}
                    className="section-card" 
                    style={{ padding: '2rem', cursor: 'pointer', border: '1px solid var(--bg-input)' }}
                >
                    <div style={{ background: '#fef3c7', color: '#d97706', width: '50px', height: '50px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <User size={24} />
                    </div>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>Your Profile</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Customize your profile and see how others see you.</p>
                </motion.div>
            </div>

            <div className="section-card premium-card" style={{ padding: 'clamp(1.5rem, 5vw, 3rem)', textAlign: 'center', background: 'linear-gradient(135deg, var(--accent) 0%, #6366f1 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                        <Star size={32} />
                    </div>
                    <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, margin: '0 0 1rem 0' }}>Nexus Premium</h2>
                    <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', opacity: 0.9, maxWidth: '500px', margin: '0 auto 2rem auto' }}>Unlock exclusive icons, custom themes, and more features to express yourself.</p>
                    <button className="voice-btn" style={{ background: 'white', color: 'var(--accent)', width: 'auto', padding: '0 3rem', borderRadius: '14px', fontWeight: 700 }}>Coming Soon</button>
                </div>
                {/* Decorative circles */}
                <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', bottom: '-150px', right: '-50px', width: '400px', height: '400px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
            </div>
        </motion.div>
    );
};

export default DashboardHome;
