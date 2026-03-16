import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    User, 
    Camera, 
    Edit3, 
    Users, 
    MapPin, 
    Link as LinkIcon, 
    Calendar,
    MessageCircle,
    Check
} from 'lucide-react';

const FullProfileView = ({ user, friends = [], onEdit }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-card"
            style={{ padding: 0, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
        >
            {/* Cover Image */}
            <div style={{ 
                height: 'clamp(150px, 30vw, 240px)', 
                background: user?.coverImage ? `url(${user.coverImage}) center/cover` : 'linear-gradient(135deg, var(--accent) 0%, #6366f1 100%)',
                position: 'relative'
            }}>
                <button 
                    onClick={onEdit}
                    style={{ 
                        position: 'absolute', bottom: '1rem', right: '1rem', 
                        background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.3)', color: 'white',
                        padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem',
                        display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'
                    }}
                >
                    <Camera size={16} /> Change Cover
                </button>
            </div>

            {/* Profile Header */}
            <div className="profile-header-container" style={{ padding: '0 2rem', position: 'relative', marginTop: '-60px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        {user?.profileImage ? (
                            <img 
                                src={user.profileImage} 
                                style={{ width: '120px', height: '120px', borderRadius: '30px', border: '5px solid var(--bg-card)', objectFit: 'cover', background: 'var(--bg-card)' }} 
                                className="profile-avatar-img"
                            />
                        ) : (
                            <div style={{ width: '120px', height: '120px', borderRadius: '30px', border: '5px solid var(--bg-card)', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }} className="profile-avatar-img">
                                <User size={60} />
                            </div>
                        )}
                        <div style={{ position: 'absolute', bottom: '10px', right: '-5px', width: '24px', height: '24px', background: '#22c55e', border: '4px solid var(--bg-card)', borderRadius: '50%' }}></div>
                    </div>
 
                    <div style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', flexWrap: 'wrap' }}>
                        <button 
                            onClick={onEdit}
                            style={{ 
                                background: 'var(--bg-app)', border: 'none', padding: '10px 20px', 
                                borderRadius: '12px', fontWeight: 700, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}
                        >
                            <Edit3 size={18} /> Edit Profile
                        </button>
                    </div>
                </div>
 
                <div style={{ marginTop: '1.5rem' }}>
                    <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', fontWeight: 800 }}>{user?.username}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', marginTop: '0.5rem', maxWidth: '600px' }}>
                        {user?.bio || "No bio yet. Add one to let people know more about you!"}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={16} /> {user?.location || 'Everywhere'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={16} /> {friends.length} Connections
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={16} /> Joined March 2026
                    </div>
                </div>
            </div>

            {/* Tabs & Content */}
            <div className="profile-content-scroll" style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                    {/* Main Content Area */}
                    <div style={{ flex: '1 1 500px', minWidth: '300px' }}>
                        <div style={{ background: 'var(--bg-app)', padding: '2rem', borderRadius: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ opacity: 0.3, marginBottom: '1rem' }}><MessageCircle size={48} style={{ margin: '0 auto' }} /></div>
                            <h3 style={{ margin: 0 }}>No posts yet</h3>
                            <p>Posts will appear here once you start sharing!</p>
                        </div>
                    </div>
 
                    {/* Sidebar Area */}
                    <div style={{ flex: '0 0 300px', minWidth: '250px' }}>
                        <div className="section-title">Connections ({friends.length})</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                            {friends.slice(0, 6).map(friend => (
                                <div key={friend._id} style={{ textAlign: 'center' }}>
                                    {friend.profileImage ? (
                                        <img src={friend.profileImage} style={{ width: '100%', aspectRatio: '1/1', borderRadius: '12px', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', aspectRatio: '1/1', background: 'var(--accent-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                                            <User size={24} />
                                        </div>
                                    )}
                                    <div style={{ fontSize: '0.7rem', fontWeight: 600, marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {friend.username}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {friends.length > 6 && (
                            <button style={{ width: '100%', background: 'none', border: '1px solid var(--bg-input)', color: 'var(--text-main)', padding: '10px', borderRadius: '12px', marginTop: '1rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                                View all
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default FullProfileView;
