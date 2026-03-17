import React, { useEffect, useState, useContext, useRef } from 'react';
import { SocketContext } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import Profile from './Profile';
import NotificationView from './NotificationView';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import CallOverlay from './CallOverlay';
import { 
    Home as HomeIcon, 
    MessageSquare, 
    Bell, 
    Settings, 
    LogOut, 
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
    LogOut as LogOutIcon,
    AlertCircle
} from 'lucide-react';

const Message = () => {
    const {
        user, socket, call, callAccepted, myVideo, userVideo,
        stream, callEnded, callUser, leaveCall, rejectCall, toggleMute, isMuted, remoteMuted, answerCall, getMedia, isCalling, logoutUser, loginUser
    } = useContext(SocketContext);

    const [users, setUsers] = useState([]); 
    const [searchResults, setSearchResults] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('friends'); 
    const [mainView, setMainView] = useState('chat'); // 'chat', 'notifications', 'profile'
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showProfile, setShowProfile] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [notifications, setNotifications] = useState([]);
    
    const navigate = useNavigate();
    const scrollRef = useRef();
    const typingTimeoutRef = useRef(null);

    const fetchFriends = () => {
        if (!user) return;
        fetch(`${import.meta.env.VITE_API_URL}/api/connections/friends/${user.id}`)
            .then(res => res.json())
            .then(data => setUsers(data));
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
            body: JSON.stringify({ requesterId: user.id, recipientId })
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
                // Different user sent message, show notification
                const sender = users.find(u => u._id === msg.senderId);
                toast.info(`New message from ${sender?.username || 'someone'}`, {
                    description: msg.text,
                    action: {
                        label: 'Chat',
                        onClick: () => {
                            setSelectedUser(sender);
                            setMainView('chat');
                        }
                    }
                });
                setNotifications(prev => [{
                    id: Date.now(),
                    type: 'message',
                    title: `Message from ${sender?.username || 'Unknown'}`,
                    message: msg.text,
                    time: 'Just now'
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
                time: 'Just now'
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
    }, [socket, selectedUser, user, users]);

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

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const logoutClick = () => setShowLogoutConfirm(true);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div 
            className="home-container"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Leftmost Purple Nav Bar */}
            <nav className="main-nav">
                <motion.div 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/profile')} 
                    style={{ cursor: 'pointer' }}
                >
                    {user?.profileImage ? (
                        <img src={user.profileImage} alt="Me" className="avatar" style={{ border: mainView === 'profile' ? '3px solid white' : '2px solid rgba(255,255,255,0.3)', width: '44px', height: '44px', boxSizing: 'border-box' }} />
                    ) : (
                        <div className="avatar" style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: mainView === 'profile' ? 'white' : 'rgba(255,255,255,0.2)', color: mainView === 'profile' ? 'var(--accent)' : 'white' }}>
                            <User size={24} />
                        </div>
                    )}
                </motion.div>
                
                <div className={`nav-item active`} onClick={() => navigate('/message')}><HomeIcon size={24} /></div>
                <div className="nav-item"><MessageSquare size={24} /></div>
                <div className={`nav-item`} onClick={() => navigate('/notification')}>
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
                                onClick={() => { setSelectedUser(u); setMainView('chat'); }}
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

            {/* Right Column: Dynamic View */}
            <div className="chat-window">
                <AnimatePresence mode="wait">
                    {mainView === 'chat' && (
                        <motion.div 
                            key="chat"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                        >
                            {selectedUser ? (
                                <>
                                    <div className="chat-header">
                                        <div className="header-user">
                                            {selectedUser.profileImage ? (
                                                <img src={selectedUser.profileImage} alt={selectedUser.username} className="avatar" />
                                            ) : (
                                                <div className="avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={24} /></div>
                                            )}
                                            <div className="header-info">
                                                <h3>{selectedUser.username}</h3>
                                                <p>{selectedUser.onlineStatus ? 'Online' : 'Offline'}</p>
                                            </div>
                                        </div>
                                        <div className="header-actions">
                                            <span onClick={() => handleStartCall(selectedUser._id, 'audio')}><Phone size={20} /></span>
                                            <span onClick={() => handleStartCall(selectedUser._id, 'video')}><Video size={20} /></span>
                                            <span><MoreVertical size={20} /></span>
                                        </div>
                                    </div>

                                    <div className="messages-area">
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

                                    <form onSubmit={handleSendMessage} className="chat-input-row">
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
                                </>
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
                            onClearOne={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
                            onClearAll={() => setNotifications([])}
                        />
                    )}

                    {mainView === 'profile' && (
                        <div style={{ height: '100%', padding: '2rem' }}>
                            <Profile onClose={() => setMainView('chat')} />
                        </div>
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

            {/* Premium Calling Overlay */}
            <AnimatePresence>
                <CallOverlay />
            </AnimatePresence>
        </motion.div>
    );
};

export default Message;
