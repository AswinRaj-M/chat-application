import React, { useEffect, useState, useContext, useRef } from 'react';
import { SocketContext } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const {
        user, socket, call, callAccepted, myVideo, userVideo,
        stream, callEnded, callUser, leaveCall, rejectCall, toggleMute, isMuted, remoteMuted, answerCall, getMedia, isCalling, logoutUser
    } = useContext(SocketContext);

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const navigate = useNavigate();
    const scrollRef = useRef();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Fetch users
        fetch(import.meta.env.VITE_API_URL)
            .then(res => res.json())
            .then(data => setUsers(data.filter(u => u._id !== user.id)));

        // Removed automatic getMedia() call to prevent camera startup

    }, [user, navigate]);

    useEffect(() => {
        if (selectedUser) {
            // Fetch messages
            fetch(`${import.meta.env.VITE_API_URL}/api/messages?senderId=${user.id}&receiverId=${selectedUser._id}`)
                .then(res => res.json())
                .then(data => setMessages(data));
        }
    }, [selectedUser]);

    const [isTyping, setIsTyping] = useState(false);

    // Typing timeout ref
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        if (!socket) return;

        // Listen for message events
        socket.on('receive-message', (msg) => {
            if (selectedUser && (msg.senderId === selectedUser._id || msg.senderId === user.id)) {
                setMessages(prev => [...prev, msg]);
                setIsTyping(false); // Clear typing when message received
            }
        });

        socket.on('user-typing', ({ senderId }) => {
            if (selectedUser && senderId === selectedUser._id) {
                setIsTyping(true);
            }
        });

        socket.on('user-stop-typing', ({ senderId }) => {
            if (selectedUser && senderId === selectedUser._id) {
                setIsTyping(false);
            }
        });

        // Listen for online status updates
        socket.on('user-status-change', ({ userId, online }) => {
            setUsers(prevUsers => prevUsers.map(u =>
                u._id === userId ? { ...u, onlineStatus: online } : u
            ));
        });

        socket.on('message-sent', (msg) => {
            // Optimistic update handled below
        });

        return () => {
            socket.off('receive-message');
            socket.off('user-typing');
            socket.off('user-stop-typing');
            socket.off('user-status-change');
        };
    }, [socket, selectedUser, user]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]); // Scroll when typing indicator appears too

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

        // Clear typing status immediately
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

    // Helper to start call
    const handleStartCall = async (id, type) => {
        const video = type === 'video';
        const s = await getMedia(video, true); // video=false for audio only
        if (s) callUser(id, s, type, selectedUser?.username);
    };

    // Helper to answer call
    const handleAnswerCall = async () => {
        // Check incoming call type
        const video = call.callType === 'video';
        const s = await getMedia(video, true);
        if (s) answerCall(s);
    };

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleUserSelect = (u) => {
        setSelectedUser(u);
        if (isMobile) {
            setSidebarOpen(false); // Logically close sidebar (though view switches)
        }
    };

    const handleBackToContacts = () => {
        setSelectedUser(null);
    };

    return (
        <div className="home-container">
            {/* Mobile: Show Sidebar (Contact List) if no user selected or if explicitly toggled (conceptually) */}
            {/* Desktop: Always show Sidebar. Mobile: Show if !selectedUser */}
            <div className={`glass-panel sidebar ${isMobile && selectedUser ? 'hidden-mobile' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>Contacts</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user?.username}</div>
                </div>
                <div style={{ marginTop: '0.5rem', marginBottom: '1rem', borderTop: 'var(--glass-border)' }}></div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {users.map(u => (
                        <div
                            key={u._id}
                            onClick={() => handleUserSelect(u)}
                            style={{
                                padding: '1rem',
                                marginBottom: '0.5rem',
                                borderRadius: '8px',
                                background: selectedUser?._id === u._id ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <span>{u.username}</span>
                            {u.onlineStatus && <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)' }}></span>}
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: 'var(--glass-border)', display: 'flex', justifyContent: 'center' }}>
                    <button onClick={logoutUser} className="btn" style={{ background: 'var(--danger)', fontSize: '0.9rem', width: '100%' }}>Logout</button>
                </div>
            </div>

            {/* Chat Area */}
            {/* Desktop: Always show. Mobile: Show ONLY if selectedUser */}
            <div className={`glass-panel chat-area ${isMobile && !selectedUser ? 'hidden-mobile' : ''}`}>
                {selectedUser ? (
                    <>
                        <div style={{ padding: '1rem', borderBottom: 'var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {/* Back Button for Mobile */}
                                {isMobile && (
                                    <button className="btn" onClick={handleBackToContacts} style={{ padding: '0.4rem 0.8rem', background: 'var(--bg-secondary)' }}>
                                        ←
                                    </button>
                                )}
                                <h3 style={{ margin: 0 }}>{selectedUser.username}</h3>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-primary" onClick={() => handleStartCall(selectedUser._id, 'audio')}>📞</button>
                                <button className="btn btn-primary" onClick={() => handleStartCall(selectedUser._id, 'video')}>📹</button>
                            </div>
                        </div>

                        <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {messages.map((m, i) => {
                                const isMe = m.senderId === user.id;
                                return (
                                    <div key={i} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                        <div className="message-bubble" style={{
                                            background: isMe ? 'var(--accent-color)' : 'var(--bg-secondary)',
                                            borderRadius: isMe ? '16px 16px 0 16px' : '16px 16px 16px 0',
                                        }}>
                                            {m.text}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.3rem', textAlign: isMe ? 'right' : 'left' }}>
                                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                )
                            })}
                            {isTyping && (
                                <div style={{ alignSelf: 'flex-start', maxWidth: '70%' }}>
                                    <div className="message-bubble" style={{
                                        background: 'var(--bg-secondary)',
                                        borderRadius: '16px 16px 16px 0',
                                        color: 'var(--text-secondary)',
                                        fontStyle: 'italic'
                                    }}>
                                        Typing...
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef}></div>
                        </div>

                        <form onSubmit={handleSendMessage} style={{ padding: '1rem', borderTop: 'var(--glass-border)', display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={handleInputCheck}
                            />
                            <button type="submit" className="btn btn-primary">Send</button>
                        </form>
                    </>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                        Select a contact
                    </div>
                )}

                {/* Call Overlay */}
                {(call.isReceivingCall && !callAccepted) && (
                    <div style={{
                        position: 'absolute', top: '20px', right: '20px', left: '20px', /* Mobile width fix */
                        background: 'var(--bg-glass)', padding: '1.5rem',
                        borderRadius: '16px', boxShadow: 'var(--shadow-lg)',
                        border: 'var(--glass-border)',
                        zIndex: 100, backdropFilter: 'blur(20px)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
                    }}>
                        <h4 style={{ marginBottom: '1rem' }}>
                            {call.name} is calling...
                        </h4>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-primary" onClick={handleAnswerCall}>Answer</button>
                            <button className="btn btn-danger" onClick={rejectCall}>Reject</button>
                        </div>
                    </div>
                )}

                {/* Calling Indication Overlay (Caller Side) */}
                {isCalling && !callAccepted && (
                    <div style={{
                        position: 'absolute', top: '20px', right: '20px', left: '20px',
                        background: 'var(--bg-glass)', padding: '1.5rem',
                        borderRadius: '16px', boxShadow: 'var(--shadow-lg)',
                        border: 'var(--glass-border)',
                        zIndex: 100, backdropFilter: 'blur(20px)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center'
                    }}>
                        <h4 style={{ marginBottom: '1rem' }}>Calling {call.name || 'User'}...</h4>
                        <button className="btn btn-danger" onClick={leaveCall}>Cancel</button>
                    </div>
                )}

                {/* Active Video Call Modal */}
                {callAccepted && !callEnded && (
                    <div className="video-modal">
                        <div className="video-grid">
                            {/* My Stream */}
                            <div className="video-wrapper" style={{ border: isMuted ? '2px solid red' : 'none' }}>
                                <video
                                    playsInline
                                    muted
                                    ref={myVideo}
                                    autoPlay
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        display: (call.callType === 'video' || (isCalling && call.callType === 'video')) ? 'block' : 'none',
                                        opacity: isMuted ? 0.7 : 1
                                    }}
                                />
                                {!(call.callType === 'video' || (isCalling && call.callType === 'video')) &&
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                        <div style={{ fontSize: '3rem' }}>{isMuted ? '🔇' : '🎤'}</div>
                                    </div>
                                }
                                <p style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', padding: '5px 10px', borderRadius: '5px' }}>
                                    You {isMuted && '(Muted)'}
                                </p>
                            </div>

                            {/* Remote Stream */}
                            <div className="video-wrapper">
                                <video
                                    playsInline
                                    ref={userVideo}
                                    autoPlay
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        display: (call.callType === 'video' || (isCalling && call.callType === 'video')) ? 'block' : 'none'
                                    }}
                                />
                                {!(call.callType === 'video' || (isCalling && call.callType === 'video')) &&
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                        <div style={{ fontSize: '3rem' }}>{remoteMuted ? '🔇' : '🔊'}</div>
                                    </div>
                                }
                                <p style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', padding: '5px 10px', borderRadius: '5px' }}>
                                    {call.name || selectedUser?.username} {remoteMuted && '(Muted)'}
                                </p>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem' }}>
                            <button className="btn" style={{ background: isMuted ? 'var(--danger)' : 'var(--bg-secondary)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }} onClick={toggleMute}>
                                {isMuted ? '🔇' : '🎤'}
                            </button>
                            <button className="btn btn-danger" style={{ width: '200px', borderRadius: '30px' }} onClick={leaveCall}>End Call</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
