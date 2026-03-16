import React, { useEffect, useState, useContext, useRef } from 'react';
import { SocketContext } from '../context/SocketContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
    Home as HomeIcon, 
    MessageSquare, 
    Bell, 
    Settings, 
    LogOut, 
    Search, 
    Users, 
    User, 
    LogOut as LogOutIcon,
    AlertCircle
} from 'lucide-react';

const ChatLayout = ({ children, notifications, pendingRequests, users, searchResults, searchQuery, handleSearch, sendFriendRequest, respondToRequest, activeTab, setActiveTab, logoutClick, selectedUser, setSelectedUser }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(SocketContext);

    const isMessage = location.pathname === '/message';
    const isNotification = location.pathname === '/notification';
    const isProfile = location.pathname === '/profile';

    return (
        <div className="home-container">
            {/* Leftmost Purple Nav Bar */}
            <nav className="main-nav">
                <motion.div 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/profile')} 
                    style={{ cursor: 'pointer' }}
                >
                    {user?.profileImage ? (
                        <img src={user.profileImage} alt="Me" className="avatar" style={{ border: isProfile ? '3px solid white' : '2px solid rgba(255,255,255,0.3)', width: '44px', height: '44px', boxSizing: 'border-box' }} />
                    ) : (
                        <div className="avatar" style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isProfile ? 'white' : 'rgba(255,255,255,0.2)', color: isProfile ? 'var(--accent)' : 'white' }}>
                            <User size={24} />
                        </div>
                    )}
                </motion.div>
                
                <div className={`nav-item ${isMessage ? 'active' : ''}`} onClick={() => navigate('/message')}><HomeIcon size={24} /></div>
                <div className="nav-item"><MessageSquare size={24} /></div>
                <div className={`nav-item ${isNotification ? 'active' : ''}`} onClick={() => navigate('/notification')}>
                    <Bell size={24} />
                    {notifications.length > 0 && <div style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', background: '#f87171', borderRadius: '50%', border: '2px solid var(--accent)' }}></div>}
                </div>
                <div className="nav-item"><Settings size={24} /></div>
                
                <div style={{ marginTop: 'auto' }} className="nav-item" onClick={logoutClick}>
                    <LogOut size={24} />
                </div>
            </nav>

            {/* Middle Column: Search and Contacts */}
            <div className="contacts-column">
                <div className="search-container">
                    <Search size={20} color="var(--text-muted)" />
                    <input 
                        type="text" 
                        placeholder="Search" 
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>

                <div className="section-card" style={{ flex: '0 0 auto', maxHeight: '40%' }}>
                    <div className="section-title">Groups</div>
                    <div className="contact-item">
                        <div className="avatar" style={{ background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309' }}>
                            <Users size={24} />
                        </div>
                        <div className="contact-info">
                            <div className="contact-name-row">
                                <span className="contact-name">Friends Forever</span>
                                <span className="contact-time">9:52pm</span>
                            </div>
                            <div className="contact-name-row">
                                <span className="contact-msg">Hahahahah!</span>
                                <span className="unread-count">4</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="section-card">
                    <div className="section-title">
                        {activeTab === 'search' ? 'Search Results' : 'People'}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                        <span 
                            style={{ cursor: 'pointer', color: activeTab === 'friends' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: activeTab === 'friends' ? 'bold' : 'normal' }}
                            onClick={() => setActiveTab('friends')}
                        >Friends</span>
                        <span 
                            style={{ cursor: 'pointer', color: activeTab === 'requests' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: activeTab === 'requests' ? 'bold' : 'normal' }}
                            onClick={() => setActiveTab('requests')}
                        >Requests ({pendingRequests.length})</span>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        <AnimatePresence>
                        {searchQuery.length > 0 && searchResults.map(u => (
                            <motion.div key={u._id} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="contact-item" onClick={() => sendFriendRequest(u._id)}>
                                {u.profileImage ? <img src={u.profileImage} className="avatar" /> : <div className="avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={20} /></div>}
                                <div className="contact-info">
                                    <div className="contact-name">{u.username}</div>
                                    <div className="contact-msg">Click to connect</div>
                                </div>
                            </motion.div>
                        ))}

                        {searchQuery.length === 0 && activeTab === 'requests' && pendingRequests.map(req => (
                            <motion.div key={req._id} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="contact-item">
                                {req.requester.profileImage ? <img src={req.requester.profileImage} className="avatar" /> : <div className="avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={20} /></div>}
                                <div className="contact-info">
                                    <div className="contact-name">{req.requester.username}</div>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '4px' }}>
                                        <button onClick={() => respondToRequest(req._id, 'accepted', req.requester._id)} style={{ fontSize: '0.7rem', padding: '4px 12px', borderRadius: '8px', border: 'none', background: 'var(--accent)', color: 'white', cursor: 'pointer' }}>Accept</button>
                                        <button onClick={() => respondToRequest(req._id, 'rejected', req.requester._id)} style={{ fontSize: '0.7rem', padding: '4px 12px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer' }}>Reject</button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {searchQuery.length === 0 && activeTab === 'friends' && users.map(u => (
                            <motion.div 
                                layout
                                key={u._id} 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="contact-item" 
                                onClick={() => { setSelectedUser(u); navigate('/message'); }}
                                style={{ background: selectedUser?._id === u._id ? '#f8fafc' : 'transparent', padding: '0.75rem', borderRadius: '16px', marginBottom: '4px' }}
                            >
                                <div style={{ position: 'relative' }}>
                                    {u.profileImage ? <img src={u.profileImage} className="avatar" /> : <div className="avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={24} /></div>}
                                    {u.onlineStatus && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, background: '#22c55e', border: '2px solid white', borderRadius: '50%' }}></div>}
                                </div>
                                <div className="contact-info">
                                    <div className="contact-name-row">
                                        <span className="contact-name">{u.username}</span>
                                        <span className="contact-time">9:52pm</span>
                                    </div>
                                    <div className="contact-msg">Tap to chat...</div>
                                </div>
                            </motion.div>
                        ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Right Column: Content */}
            <div className="chat-window">
                {children}
            </div>
        </div>
    );
};

export default ChatLayout;
