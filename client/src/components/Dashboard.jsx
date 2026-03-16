import React, { useEffect, useState, useContext, useRef } from 'react';
import { SocketContext } from '../context/SocketContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Profile from './Profile';
import NotificationView from './NotificationView';
import DashboardHome from './DashboardHome';
import FullProfileView from './FullProfileView';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
    Home as HomeIcon, 
    MessageSquare, 
    Bell, 
    Settings,
    Search, 
    Users, 
    User, 
    Phone, 
    Video, 
    MoreVertical, 
    Paperclip, 
    Smile, 
    Camera, 
    Mic, 
    Send,
    LogOut,
    Trash2,
    Menu,
    ChevronLeft
} from 'lucide-react';

const Dashboard = () => {
    const {
        user, socket, call, callAccepted, myVideo, userVideo,
        stream, callEnded, callUser, leaveCall, rejectCall, toggleMute, isMuted, remoteMuted, answerCall, getMedia, isCalling, logoutUser, loginUser
    } = useContext(SocketContext);

    const navigate = useNavigate();
    const location = useLocation();

    const [users, setUsers] = useState([]); 
    const [searchResults, setSearchResults] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('friends'); 
    const [mainView, setMainView] = useState('home'); // 'home', 'chat', 'notifications', 'profile', 'settings'
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showEditProfile, setShowEditProfile] = useState(false);
    
    const scrollRef = useRef();
    const typingTimeoutRef = useRef(null);

    // Sync mainView with URL
    useEffect(() => {
        const path = location.pathname;
        if (path === '/notification') setMainView('notifications');
        else if (path === '/profile') setMainView('profile');
        else if (path === '/settings') setMainView('settings');
        else if (path === '/home') setMainView('home');
        else if (path === '/message') setMainView('chat');
    }, [location.pathname]);

    const fetchFriends = () => {
        if (!user) return;
        fetch(`${import.meta.env.VITE_API_URL}/api/connections/friends/${user.id}`)
            .then(res => res.ok ? res.json() : [])
            .then(data => setUsers(Array.isArray(data) ? data : []))
            .catch(() => setUsers([]));
    };

    const fetchPendingRequests = () => {
        if (!user) return;
        fetch(`${import.meta.env.VITE_API_URL}/api/connections/pending/${user.id}`)
            .then(res => res.json())
            .then(data => setPendingRequests(data));
    };

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 1) {
            fetch(`${import.meta.env.VITE_API_URL}/api/auth/search?username=${query}`)
                .then(res => res.json())
                .then(data => setSearchResults(data.filter(u => u._id !== user.id)));
        } else {
            setSearchResults([]);
        }
    };

    const sendFriendRequest = (recipientId) => {
        fetch(`${import.meta.env.VITE_API_URL}/api/connections/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requesterId: (user?.id || user?._id), recipientId })
        })
            .then(res => res.json())
            .then(data => {
                toast.success(data.message);
                socket.emit('send-friend-request', { recipientId, requesterName: user.username });
                setSearchQuery('');
                setSearchResults([]);
            });
    };

    const respondToRequest = (connectionId, status, requesterId) => {
        fetch(`${import.meta.env.VITE_API_URL}/api/connections/respond`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ connectionId, status })
        })
            .then(res => res.json())
            .then(data => {
                if (status === 'accepted') {
                   toast.success('Connection request accepted!');
                   socket.emit('accept-friend-request', { requesterId, acceptorName: user.username });
                }
                fetchPendingRequests();
                fetchFriends();
            });
    };

    const markNotificationAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchFriends();
        fetchPendingRequests();
    }, [user, navigate]);

    useEffect(() => {
        if (selectedUser) {
            fetch(`${import.meta.env.VITE_API_URL}/api/messages?senderId=${user.id}&receiverId=${selectedUser._id}`)
                .then(res => res.status === 403 ? [] : res.json())
                .then(data => setMessages(data));
        }
    }, [selectedUser]);

    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        if (!socket) return;

        socket.on('receive-message', (msg) => {
            if (selectedUser && (msg.senderId === selectedUser._id || msg.senderId === user.id)) {
                setMessages(prev => [...prev, msg]);
                setIsTyping(false);
            } else {
                const sender = users.find(u => u._id === msg.senderId);
                toast.info(`New message from ${sender?.username || 'someone'}`, {
                    description: msg.text,
                    action: {
                        label: 'Chat',
                        onClick: () => {
                            setSelectedUser(sender);
                            navigate('/message');
                        }
                    }
                });
                setNotifications(prev => [{
                    id: Date.now(),
                    type: 'message',
                    title: `Message from ${sender?.username || 'Unknown'}`,
                    message: msg.text,
                    time: 'Just now',
                    read: false
                }, ...prev]);
            }
        });

        socket.on('friend-request-received', ({ requesterName }) => {
            fetchPendingRequests();
            toast.info(`New friend request from ${requesterName}`);
            setNotifications(prev => [{
                id: Date.now(),
                type: 'request',
                title: 'Friend Request',
                message: `${requesterName} wants to connect with you`,
                time: 'Just now',
                read: false
            }, ...prev]);
        });

        socket.on('friend-request-accepted', ({ acceptorName }) => {
            fetchFriends();
            toast.success(`${acceptorName} accepted your request!`);
        });

        socket.on('user-typing', ({ senderId }) => {
            if (selectedUser && senderId === selectedUser._id) setIsTyping(true);
        });

        socket.on('user-stop-typing', ({ senderId }) => {
            if (selectedUser && senderId === selectedUser._id) setIsTyping(false);
        });

        socket.on('user-status-change', ({ userId, online }) => {
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, onlineStatus: online } : u));
        });

        return () => {
            socket.off('receive-message');
            socket.off('friend-request-received');
            socket.off('friend-request-accepted');
            socket.off('user-typing');
            socket.off('user-stop-typing');
            socket.off('user-status-change');
        };
    }, [socket, selectedUser, user, users, navigate]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleInputCheck = (e) => {
        setNewMessage(e.target.value);
        if (!selectedUser) return;
        socket.emit('typing', { senderId: user.id, receiverId: selectedUser._id });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop-typing', { senderId: user.id, receiverId: selectedUser._id });
        }, 1500);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        socket.emit('stop-typing', { senderId: user.id, receiverId: selectedUser._id });
        const msgData = {
            senderId: user.id,
            receiverId: selectedUser._id,
            text: newMessage,
            timestamp: new Date()
        };
        socket.emit('send-message', msgData);
        setMessages(prev => [...prev, msgData]);
        setNewMessage('');
    };

    const handleStartCall = async (id, type) => {
        const video = type === 'video';
        const s = await getMedia(video, true);
        if (s) callUser(id, s, type, selectedUser?.username);
    };

    const handleAnswerCall = async () => {
        const video = call.callType === 'video';
        const s = await getMedia(video, true);
        if (s) answerCall(s);
    };

    const logoutClick = () => setShowLogoutConfirm(true);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } }
    };

    const hasMiddleColumn = !(mainView === 'home' || mainView === 'profile' || mainView === 'settings' || mainView === 'notifications');

    return (
        <motion.div 
            className={`dashboard-shell ${hasMiddleColumn ? 'with-sidebar' : 'no-sidebar'}`}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Sidebar Navigation (Desktop) */}
            <nav className="main-nav">
                <motion.div 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/profile')} 
                    style={{ cursor: 'pointer' }}
                >
                    {user?.profileImage ? (
                        <img src={user.profileImage} alt="Me" className="avatar" style={{ border: mainView === 'profile' ? '3px solid var(--accent-light)' : '2px solid rgba(255,255,255,0.2)', width: '44px', height: '44px', boxSizing: 'border-box' }} />
                    ) : (
                        <div className="avatar" style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: mainView === 'profile' ? 'var(--accent-light)' : 'rgba(255,255,255,0.1)', color: mainView === 'profile' ? 'var(--accent)' : 'white' }}>
                            <User size={24} />
                        </div>
                    )}
                </motion.div>
                
                <div className={`nav-item ${mainView === 'home' ? 'active' : ''}`} onClick={() => navigate('/home')} title="Home"><HomeIcon size={24} /></div>
                <div className={`nav-item ${mainView === 'chat' ? 'active' : ''}`} onClick={() => navigate('/message')} title="Messages"><MessageSquare size={24} /></div>
                <div className={`nav-item ${mainView === 'notifications' ? 'active' : ''}`} onClick={() => navigate('/notification')} title="Notifications">
                    <Bell size={24} />
                    {notifications.filter(n => !n.read).length > 0 && <div style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', background: '#f87171', borderRadius: '50%', border: '2px solid var(--accent)' }}></div>}
                </div>
                <div className={`nav-item ${mainView === 'settings' ? 'active' : ''}`} onClick={() => navigate('/settings')} title="Settings"><Settings size={24} /></div>
                
                <div style={{ marginTop: 'auto' }} className="nav-item" onClick={logoutClick} title="Logout">
                    <LogOut size={24} />
                </div>
            </nav>

            {/* Mobile Navigation */}
            <div className="mobile-nav">
                <div className={`mobile-nav-item ${mainView === 'home' ? 'active' : ''}`} onClick={() => navigate('/home')}>
                    <HomeIcon size={24} />
                    <span>Home</span>
                </div>
                <div className={`mobile-nav-item ${mainView === 'chat' ? 'active' : ''}`} onClick={() => navigate('/message')}>
                    <MessageSquare size={24} />
                    <span>Chat</span>
                </div>
                <div className={`mobile-nav-item ${mainView === 'notifications' ? 'active' : ''}`} onClick={() => navigate('/notification')}>
                    <div style={{ position: 'relative' }}>
                        <Bell size={24} />
                        {notifications.filter(n => !n.read).length > 0 && <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#f87171', borderRadius: '50%' }}></div>}
                    </div>
                    <span>Alerts</span>
                </div>
                <div className={`mobile-nav-item ${mainView === 'profile' ? 'active' : ''}`} onClick={() => navigate('/profile')}>
                    <User size={24} />
                    <span>Profile</span>
                </div>
            </div>

            {/* Middle Column (Friends/Search) - Only visible on specific views */}
            <div className="contacts-column" style={{ 
                display: (mainView === 'home' || mainView === 'profile' || mainView === 'settings' || mainView === 'notifications' || (mainView === 'chat' && selectedUser)) ? 'none' : 'flex',
                width: '100%',
                maxWidth: (mainView === 'chat' && !selectedUser) ? 'none' : '350px'
            }}>
                <div className="search-container">
                    <Search size={20} color="var(--text-muted)" />
                    <input 
                        type="text" 
                        placeholder="Search" 
                        value={searchQuery}
                        onChange={handleSearch}
                    />
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

                        {searchQuery.length === 0 && activeTab === 'friends' && Array.isArray(users) && users.map(u => (
                            <motion.div 
                                layout
                                key={u._id} 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }}
                                className={`contact-item ${selectedUser?._id === u._id && mainView === 'chat' ? 'active' : ''}`}
                                onClick={() => { setSelectedUser(u); setMainView('chat'); }}
                                style={{ marginBottom: '4px' }}
                            >
                                <div style={{ position: 'relative', display: 'flex' }}>
                                    {u.profileImage ? <img src={u.profileImage} className="avatar" /> : <div className="avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-input)', color: 'var(--text-muted)' }}><User size={24} /></div>}
                                    {u.onlineStatus && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, background: '#22c55e', border: '2px solid var(--bg-card)', borderRadius: '50%' }}></div>}
                                </div>
                                <div className="contact-info">
                                    <div className="contact-name-row">
                                        <span className="contact-name">{u.username}</span>
                                        <span className="contact-time">Online</span>
                                    </div>
                                    <div className="contact-msg">Tap to chat...</div>
                                </div>
                            </motion.div>
                        ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="main-viewport" style={{ 
                flex: 1, 
                padding: (mainView === 'home' || mainView === 'notifications') ? '0' : '1rem', 
                overflowY: 'auto',
                display: (mainView === 'chat' && !selectedUser) ? 'none' : 'block'
            }}>
                <AnimatePresence mode="wait">
                    {mainView === 'home' && (
                        <DashboardHome key="home" user={user} onNavigate={navigate} />
                    )}

                    {mainView === 'chat' && (
                        <motion.div 
                            key="chat"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                        >
                            {selectedUser ? (
                                <div className="section-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 0 }}>
                                    <div className="chat-header" style={{ padding: 'clamp(0.75rem, 2vh, 1.5rem)', borderBottom: '1px solid var(--bg-input)' }}>
                                        <div className="header-user">
                                            <div className="mobile-only" onClick={() => setSelectedUser(null)} style={{ marginRight: '0.5rem', cursor: 'pointer' }}>
                                                <ChevronLeft size={24} />
                                            </div>
                                            {selectedUser.profileImage ? (
                                                <img src={selectedUser.profileImage} alt={selectedUser.username} className="avatar" />
                                            ) : (
                                                <div className="avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={24} /></div>
                                            )}
                                            <div className="header-info">
                                                <h3 style={{ margin: 0 }}>{selectedUser.username}</h3>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#22c55e' }}>{selectedUser.onlineStatus ? 'Online' : 'Offline'}</p>
                                            </div>
                                        </div>
                                        <div className="header-actions">
                                            <span onClick={() => handleStartCall(selectedUser._id, 'audio')}><Phone size={20} /></span>
                                            <span onClick={() => handleStartCall(selectedUser._id, 'video')}><Video size={20} /></span>
                                            <span><MoreVertical size={20} /></span>
                                        </div>
                                    </div>

                                    <div className="messages-area" style={{ flex: 1, padding: '1.5rem' }}>
                                        {messages.map((m, i) => {
                                            const isMe = m.senderId === user.id;
                                            return (
                                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }} key={i} className={`message-group ${isMe ? 'sent' : 'received'}`}>
                                                    <div className="bubble">
                                                        {m.text}
                                                        {isMe && <div className="indicator-dot"></div>}
                                                    </div>
                                                    <span className="msg-time">
                                                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </motion.div>
                                            )
                                        })}
                                        {isTyping && (
                                            <div className="message-group received">
                                                <div className="bubble" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>typing...</motion.span>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={scrollRef} />
                                    </div>

                                    <form onSubmit={handleSendMessage} className="chat-input-row" style={{ padding: '1.5rem' }}>
                                        <div className="input-container">
                                            <span style={{ cursor: 'pointer' }}><Paperclip size={20} /></span>
                                            <input type="text" placeholder="Type your message here..." value={newMessage} onChange={handleInputCheck} />
                                            <div className="input-icons">
                                                <span><Smile size={20} /></span>
                                                <span><Camera size={20} /></span>
                                            </div>
                                        </div>
                                        <button type="submit" className="voice-btn">
                                            {newMessage.trim() ? <Send size={20} /> : <Mic size={20} />}
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: '1rem' }}>
                                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }} style={{ color: 'var(--accent)', opacity: 0.2 }}><MessageSquare size={100} /></motion.div>
                                    <p>Select a contact to start messaging</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {mainView === 'notifications' && (
                        <NotificationView 
                            key="notifications"
                            notifications={notifications} 
                            onMarkAsRead={markNotificationAsRead}
                            onClearOne={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
                            onClearAll={() => setNotifications([])}
                        />
                    )}

                    {mainView === 'profile' && (
                        <FullProfileView 
                            key="profile" 
                            user={user} 
                            friends={users} 
                            onEdit={() => navigate('/settings')} 
                        />
                    )}

                    {mainView === 'settings' && (
                        <motion.div 
                            key="settings"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            style={{ padding: 'clamp(1rem, 5vw, 2rem)', height: '100%', overflowY: 'auto' }}
                        >
                            <div className="section-card" style={{ maxWidth: '800px', margin: '0 auto', width: '100%', height: 'auto', flex: 'none' }}>
                                <Profile onClose={() => navigate('/profile')} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Logout Confirmation */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="section-card" 
                            style={{ width: '100%', maxWidth: '350px', padding: '2.5rem', textAlign: 'center' }}
                        >
                            <div style={{ background: '#fee2e2', color: '#ef4444', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                <AlertCircle size={32} />
                            </div>
                            <h3 style={{ marginBottom: '1rem', fontWeight: 800 }}>Confirm Logout</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Are you sure you want to exit? We'll miss you!</p>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setShowLogoutConfirm(false)} className="btn" style={{ flex: 1, background: 'var(--bg-app)', border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                                <button onClick={logoutUser} className="btn" style={{ flex: 1, background: '#ef4444', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>Yes, Logout</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Calling Overlays */}
            <AnimatePresence>
            {(call.isReceivingCall && !callAccepted) && (
                <motion.div initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }} style={{ position: 'fixed', top: '2rem', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '1.5rem 2rem', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', zIndex: 3000, textAlign: 'center', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Incoming Call</div>
                    <h3>{call.name}</h3>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button onClick={handleAnswerCall} className="voice-btn" style={{ background: '#22c55e', width: 'auto', padding: '0 2rem', borderRadius: '12px' }}>Answer</button>
                        <button onClick={rejectCall} className="voice-btn" style={{ background: '#ef4444', width: 'auto', padding: '0 2rem', borderRadius: '12px' }}>Reject</button>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>

            {/* Video Modal */}
            {callAccepted && !callEnded && (
                <div className="video-modal">
                    <div className="video-grid">
                        <div className="video-wrapper">
                            <video playsInline muted ref={myVideo} autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div className="video-wrapper">
                            <video playsInline ref={userVideo} autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    </div>
                    <div style={{ position: 'absolute', bottom: '40px', display: 'flex', gap: '2rem' }}>
                        <button onClick={toggleMute} className="voice-btn" style={{ background: isMuted ? '#ef4444' : 'var(--accent)' }}>{isMuted ? <Mic size={24} /> : <Mic size={24} />}</button>
                        <button onClick={leaveCall} className="btn" style={{ background: '#ef4444', color: 'white', borderRadius: '30px', padding: '0.8rem 3rem', cursor: 'pointer' }}>End Call</button>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default Dashboard;
