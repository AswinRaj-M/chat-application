import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Bell, Settings, LogOut, User } from 'lucide-react';
import { SocketContext } from '../../context/SocketContext';

const Sidebar = () => {
    const { user, logoutUser, notifications } = useContext(SocketContext);
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <nav className="main-nav">
                <motion.div 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/profile')} 
                    style={{ cursor: 'pointer' }}
                >
                    {user?.profileImage ? (
                        <img src={user.profileImage} alt="Me" className="avatar" style={{ border: isActive('/profile') ? '3px solid white' : '2px solid rgba(255,255,255,0.3)', width: '44px', height: '44px', boxSizing: 'border-box' }} />
                    ) : (
                        <div className="avatar" style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActive('/profile') ? 'white' : 'rgba(255,255,255,0.2)', color: isActive('/profile') ? 'var(--accent)' : 'white' }}>
                            <User size={24} />
                        </div>
                    )}
                </motion.div>
                
                <div className={`nav-item ${isActive('/home') ? 'active' : ''}`} onClick={() => navigate('/home')} title="Discover">
                    <Home size={24} />
                </div>
                <div className={`nav-item ${isActive('/chat') ? 'active' : ''}`} onClick={() => navigate('/chat')} title="Messages">
                    <MessageSquare size={24} />
                </div>
                <div className={`nav-item ${isActive('/notifications') ? 'active' : ''}`} onClick={() => navigate('/notifications')} title="Activity">
                    <Bell size={24} />
                    {notifications.filter(n => !n.read).length > 0 && (
                        <div style={{ 
                            position: 'absolute', top: '8px', right: '8px', 
                            width: '10px', height: '10px', background: '#ef4444', 
                            borderRadius: '50%', border: '2px solid var(--bg-nav)' 
                        }}></div>
                    )}
                </div>
                <div className={`nav-item ${isActive('/settings') ? 'active' : ''}`} onClick={() => navigate('/settings')} title="Settings">
                    <Settings size={24} />
                </div>
                
                <div style={{ marginTop: 'auto' }} className="nav-item" onClick={logoutUser} title="Sign Out">
                    <LogOut size={24} />
                </div>
            </nav>

            <nav className="mobile-nav">
                <div className={`mobile-nav-item ${isActive('/home') ? 'active' : ''}`} onClick={() => navigate('/home')}>
                    <Home size={22} />
                    <span>Home</span>
                </div>
                <div className={`mobile-nav-item ${isActive('/chat') ? 'active' : ''}`} onClick={() => navigate('/chat')}>
                    <MessageSquare size={22} />
                    <span>Chat</span>
                </div>
                <div className={`mobile-nav-item ${isActive('/notifications') ? 'active' : ''}`} onClick={() => navigate('/notifications')}>
                    <div style={{ position: 'relative' }}>
                        <Bell size={22} />
                        {notifications.filter(n => !n.read).length > 0 && (
                            <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: '#ef4444', borderRadius: '50%', border: '1.5px solid var(--bg-card)' }}></div>
                        )}
                    </div>
                    <span>Activity</span>
                </div>
                <div className={`mobile-nav-item ${isActive('/profile') ? 'active' : ''}`} onClick={() => navigate('/profile')}>
                    <User size={22} />
                    <span>Profile</span>
                </div>
                <div className={`mobile-nav-item ${isActive('/settings') ? 'active' : ''}`} onClick={() => navigate('/settings')}>
                    <Settings size={22} />
                    <span>Settings</span>
                </div>
            </nav>
        </>
    );
};

export default Sidebar;
