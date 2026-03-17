import React, { useEffect, useState, useContext, useRef } from 'react';
import { SocketContext } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
    MessageSquare, 
    Search, 
    User, 
    Phone, 
    Video, 
    MoreVertical, 
    Paperclip, 
    Smile, 
    Camera, 
    Mic, 
    Send,
    AlertCircle,
    ChevronLeft
} from 'lucide-react';

import Sidebar from '../components/ui/Sidebar';
import CallOverlay from '../components/call/CallOverlay';
import { fetchData } from '../services/api';

const ChatPage = () => {
    const {
        user, socket, getMedia, callUser, logoutUser
    } = useContext(SocketContext);

    const [users, setUsers] = useState([]); 
    const [searchResults, setSearchResults] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('friends'); 
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    
    const navigate = useNavigate();
    const scrollRef = useRef();
    const typingTimeoutRef = useRef(null);

    const fetchFriends = async () => {
        if (!user) return;
        const { ok, data } = await fetchData(`/api/connections/friends/${user.id}`);
        if (ok) setUsers(data);
    };

    const fetchPendingRequests = async () => {
        if (!user) return;
        const { ok, data } = await fetchData(`/api/connections/pending/${user.id}`);
        if (ok) setPendingRequests(data);
    };

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 1) {
            const { ok, data } = await fetchData(`/api/auth/search?username=${query}`);
            if (ok) setSearchResults(data.filter(u => u._id !== user.id));
        } else {
            setSearchResults([]);
        }
    };

    const sendFriendRequest = async (recipientId) => {
        const { ok, data } = await fetchData('/api/connections/request', {
            method: 'POST',
            body: JSON.stringify({ requesterId: user.id, recipientId })
        });
        if (ok) {
            toast.success(data.message);
            socket.emit('send-friend-request', { recipientId, requesterName: user.username });
            setSearchQuery('');
            setSearchResults([]);
        }
    };

    const respondToRequest = async (connectionId, status, requesterId) => {
        const { ok } = await fetchData('/api/connections/respond', {
            method: 'PUT',
            body: JSON.stringify({ connectionId, status })
        });
        if (ok) {
            if (status === 'accepted') {
               toast.success('Connection request accepted!');
               socket.emit('accept-friend-request', { requesterId, acceptorName: user.username });
            }
            fetchPendingRequests();
            fetchFriends();
        }
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
        const fetchMessages = async () => {
            if (selectedUser) {
                const { ok, data } = await fetchData(`/api/messages?senderId=${user.id}&receiverId=${selectedUser._id}`);
                if (ok) setMessages(data);
                else setMessages([]);
            }
        };
        fetchMessages();
    }, [selectedUser, user.id]);

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
                    action: { label: 'Chat', onClick: () => setSelectedUser(sender) }
                });
            }
        });

        socket.on('friend-request-received', ({ requesterName }) => {
            fetchPendingRequests();
            toast.info(`New friend request from ${requesterName}`);
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

    const logoutClick = () => setShowLogoutConfirm(true);

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

            <div className={`contacts-column ${selectedUser ? 'mobile-hide' : ''}`}>
                <div className="search-container">
                    <Search size={20} color="var(--text-muted)" />
                    <input 
                        type="text" 
                        placeholder="Search chats..." 
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>

                <div className="section-card">
                    <div className="section-title">
                        {searchQuery.length > 0 ? 'Results' : 'Conversations'}
                    </div>
                    
                    {searchQuery.length === 0 && (
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', marginBottom: '0.5rem', padding: '0 0.5rem' }}>
                            <span 
                                style={{ cursor: 'pointer', color: activeTab === 'friends' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: activeTab === 'friends' ? 'bold' : 'normal' }}
                                onClick={() => setActiveTab('friends')}
                            >Friends ({users.length})</span>
                            <span 
                                style={{ cursor: 'pointer', color: activeTab === 'requests' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: activeTab === 'requests' ? 'bold' : 'normal' }}
                                onClick={() => setActiveTab('requests')}
                            >Pending ({pendingRequests.length})</span>
                        </div>
                    )}

                    <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                        <AnimatePresence>
                        {searchQuery.length > 0 && searchResults.map(u => (
                            <motion.div key={u._id} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="contact-item" onClick={() => sendFriendRequest(u._id)}>
                                {u.profileImage ? <img src={u.profileImage} className="avatar" /> : <div className="avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={20} /></div>}
                                <div className="contact-info">
                                    <div className="contact-name">{u.username}</div>
                                    <div className="contact-msg">Add to contacts</div>
                                </div>
                            </motion.div>
                        ))}

                        {searchQuery.length === 0 && activeTab === 'requests' && pendingRequests.map(req => (
                            <motion.div key={req._id} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="contact-item">
                                {req.requester.profileImage ? <img src={req.requester.profileImage} className="avatar" /> : <div className="avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={20} /></div>}
                                <div className="contact-info">
                                    <div className="contact-name">{req.requester.username}</div>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '4px' }}>
                                        <button onClick={() => respondToRequest(req._id, 'accepted', req.requester._id)} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'var(--accent)', color: 'white', cursor: 'pointer', fontSize: '0.75rem' }}>Accept</button>
                                        <button onClick={() => respondToRequest(req._id, 'rejected', req.requester._id)} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem' }}>Ignore</button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {searchQuery.length === 0 && activeTab === 'friends' && users.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                <p>No friends yet. Discover new people to start chatting!</p>
                            </div>
                        )}
                        {searchQuery.length === 0 && activeTab === 'friends' && users.map(u => (
                            <motion.div 
                                layout
                                key={u._id} 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="contact-item" 
                                onClick={() => setSelectedUser(u)}
                                style={{ background: selectedUser?._id === u._id ? 'var(--accent-light)' : 'transparent', borderRadius: '14px' }}
                            >
                                <div style={{ position: 'relative' }}>
                                    {u.profileImage ? <img src={u.profileImage} className="avatar" /> : <div className="avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={24} /></div>}
                                    {u.onlineStatus && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, background: '#22c55e', border: '2px solid white', borderRadius: '50%' }}></div>}
                                </div>
                                <div className="contact-info">
                                    <div className="contact-name-row">
                                        <span className="contact-name">{u.username}</span>
                                        <span className="contact-time">10:42am</span>
                                    </div>
                                    <div className="contact-msg">{u.onlineStatus ? 'Actively Online' : 'Active yesterday'}</div>
                                </div>
                            </motion.div>
                        ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <div className={`chat-window ${!selectedUser ? 'mobile-hide' : ''}`}>
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={selectedUser?._id || 'empty'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}
                    >
                        {selectedUser ? (
                            <>
                                <div className="chat-header">
                                    <div className="header-user">
                                        <button 
                                            className="mobile-only"
                                            onClick={() => setSelectedUser(null)}
                                            style={{ 
                                                background: 'none', border: 'none', color: 'var(--text-main)', 
                                                padding: '5px', marginRight: '5px', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center'
                                            }}
                                        >
                                            <ChevronLeft size={24} />
                                        </button>
                                        {selectedUser.profileImage ? (
                                            <img src={selectedUser.profileImage} alt={selectedUser.username} className="avatar" />
                                        ) : (
                                            <div className="avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={24} /></div>
                                        )}
                                        <div className="header-info">
                                            <h3>{selectedUser.username}</h3>
                                            <p style={{ color: selectedUser.onlineStatus ? '#22c55e' : 'var(--text-muted)' }}>
                                                {selectedUser.onlineStatus ? 'Online' : 'Offline'}
                                            </p>
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
                                            <div className="bubble" style={{ color: 'var(--text-muted)', fontStyle: 'italic', background: 'transparent', boxShadow: 'none' }}>
                                                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>Typing...</motion.span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={scrollRef} />
                                </div>

                                <form onSubmit={handleSendMessage} className="chat-input-row">
                                    <div className="input-container">
                                        <span style={{ cursor: 'pointer' }}><Paperclip size={20} /></span>
                                        <input type="text" placeholder="Type your message..." value={newMessage} onChange={handleInputCheck} />
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
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: '1rem', padding: '2rem', textAlign: 'center' }}>
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 0.1, scale: 1 }}
                                    transition={{ duration: 1 }}
                                    style={{ color: 'var(--accent)' }}
                                >
                                    <MessageSquare size={120} />
                                </motion.div>
                                <h2 style={{ opacity: 0.5, fontWeight: 800, margin: 0 }}>Nexus Messaging</h2>
                                <p style={{ maxWidth: '320px', lineHeight: 1.6, margin: 0 }}>Connect with your friends via high-quality video and audio calls or instant messaging.</p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {showLogoutConfirm && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="section-card" 
                            style={{ width: '90%', maxWidth: '380px', padding: '2.5rem', textAlign: 'center', borderRadius: '24px' }}
                        >
                            <div style={{ background: '#fee2e2', color: '#ef4444', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                <AlertCircle size={32} />
                            </div>
                            <h2 style={{ marginBottom: '1rem', fontWeight: 800 }}>Sign Out?</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.5' }}>You will need to login again to access your messages and calls.</p>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setShowLogoutConfirm(false)} style={{ flex: 1, background: 'var(--bg-app)', border: 'none', padding: '14px', borderRadius: '14px', cursor: 'pointer', fontWeight: 700, color: 'var(--text-main)' }}>Cancel</button>
                                <button onClick={logoutUser} style={{ flex: 1, background: '#ef4444', color: 'white', border: 'none', padding: '14px', borderRadius: '14px', cursor: 'pointer', fontWeight: 700 }}>Log Out</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <CallOverlay />
        </motion.div>
    );
};

export default ChatPage;
