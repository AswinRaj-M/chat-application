import React, { createContext, useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';

const SocketContext = createContext();

const socket = io(process.env.VITE_API_URL);

const ContextProvider = ({ children }) => {
    const [me, setMe] = useState('');
    const [user, setUser] = useState(() => {
        const savedUser = sessionStorage.getItem('chat_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [onlineUsers, setOnlineUsers] = useState([]);

    const [isMuted, setIsMuted] = useState(false);
    const [remoteMuted, setRemoteMuted] = useState(false);

    // Call State
    const [call, setCall] = useState({});
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [stream, setStream] = useState();
    const [name, setName] = useState('');
    const [isCalling, setIsCalling] = useState(false);

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

    useEffect(() => {
        const handleConnect = () => {
            setMe(socket.id);
            // Re-register if we have a user (handling server restarts)
            if (user) socket.emit('register-user', user.id);
        };

        if (socket.connected) {
            handleConnect();
        }

        socket.on('connect', handleConnect);

        socket.on('user-status-change', ({ userId, online }) => {
            console.log('User status changed', userId, online);
        });

        socket.on('incoming-call', ({ from, name: callerName, signal, callType }) => {
            // Busy check: If already in a call, auto-reject (or we could show "Call Waiting")
            if (isCalling || callAccepted) {
                socket.emit('reject-call', { to: from });
                return;
            }
            setCall({ isReceivingCall: true, from, name: callerName, signal, callType });
        });

        socket.on('call-rejected', () => {
            alert("Call Declined / User Busy");
            leaveCall(); // Cleanup
        });

        socket.on('peer-mute-status', ({ isMuted }) => {
            setRemoteMuted(isMuted);
        });

        socket.on('call-accepted', (data) => {
            setCallAccepted(true);

            const signal = data.signal ? data.signal : data; // Handle both { signal, name } and raw signal
            const name = data.name;

            if (name) {
                setCall(prev => ({ ...prev, name })); // Update name with confirmed answerer name
            }

            if (connectionRef.current) {
                console.log('Call accepted by remote, signaling peer...', signal);
                connectionRef.current.signal(signal);
            }
        });

        socket.on('call-ended', () => {
            leaveCall();
        });

        return () => {
            socket.off('connect', handleConnect);
            socket.off('user-status-change');
            socket.off('incoming-call');
            socket.off('call-rejected');
            socket.off('peer-mute-status');
            socket.off('call-accepted'); // Added cleanup for call-accepted
            socket.off('call-ended');
        };

    }, [user, isCalling, callAccepted]); // Added dependencies for busy check

    // Prevent accidental page reloads during a call
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isCalling || (callAccepted && !callEnded)) {
                e.preventDefault();
                e.returnValue = "You have an active call. Are you sure you want to leave?";
                return "You have an active call. Are you sure you want to leave?";
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isCalling, callAccepted, callEnded]);

    const loginUser = (userData) => {
        setUser(userData);
        sessionStorage.setItem('chat_user', JSON.stringify(userData));
        socket.emit('register-user', userData.id);
    };

    const logoutUser = () => {
        setUser(null);
        sessionStorage.removeItem('chat_user');
        socket.emit('logout');
        window.location.href = '/login';
    };

    const answerCall = (currentStream) => {
        setCallAccepted(true);
        // Ensure stream is valid
        const peer = new Peer({ initiator: false, trickle: false, stream: currentStream || stream });

        peer.on('error', (err) => {
            console.error('Peer connection error (answer):', err);
            // alert(`Call Error (Answer): ${err.message}`); // Optional: alert user
            leaveCall();
        });

        peer.on('signal', (data) => {
            console.log('Answering call, emitting signal...', data);
            socket.emit('answer-call', { signal: data, to: call.from, name: user.username });
        });

        peer.on('stream', (currentStream) => {
            console.log('Received remote stream (answer side)');
            if (userVideo.current) userVideo.current.srcObject = currentStream;
        });

        console.log('Signaling peer with incoming offer...');
        peer.signal(call.signal);
        connectionRef.current = peer;
    };

    const callUser = (id, currentStream, type = 'video', calleeName) => {
        setIsCalling(true);
        // Store call details locally: name should be the CALLEE's name for the caller's UI
        setCall({ isReceivingCall: false, from: me, name: calleeName, callType: type, userToCall: id });

        const peer = new Peer({ initiator: true, trickle: false, stream: currentStream || stream });

        peer.on('error', (err) => {
            console.error('Peer connection error (caller):', err);
            // alert(`Call Error (Caller): ${err.message}`);
            leaveCall();
        });

        peer.on('signal', (data) => {
            console.log('Calling user, emitting signal...', data);
            socket.emit('call-user', {
                userToCall: id,
                signalData: data,
                from: me,
                name: user.username, // Send MY name to the receiver
                callType: type
            });
        });

        peer.on('stream', (currentStream) => {
            console.log('Received remote stream (caller side)');
            if (userVideo.current) userVideo.current.srcObject = currentStream;
        });

        // Removed internal socket.on('call-accepted')

        connectionRef.current = peer;
    };

    const rejectCall = () => {
        socket.emit('reject-call', { to: call.from });
        setCall({});
        setIsCalling(false);
    };

    const toggleMute = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);

                // If I am caller (isCalling=true), I called userToCall (User ID).
                // If I am receiver (isCalling=false), call came from call.from (Socket ID).
                const targetId = isCalling ? call.userToCall : call.from;
                if (targetId) {
                    socket.emit('mute-status', { to: targetId, isMuted: !audioTrack.enabled });
                }
            }
        }
    };

    const leaveCall = () => {
        setCallEnded(true);
        if (connectionRef.current) connectionRef.current.destroy();
        setCall({});
        setIsCalling(false);
        setCallAccepted(false);
        setIsMuted(false);
        setRemoteMuted(false);

        // Stop all tracks to turn off camera light
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }

        const targetId = isCalling ? call.userToCall : call.from;
        if (targetId) socket.emit('end-call', { to: targetId });
    };

    // Get Media Stream
    const getMedia = async (video = true, audio = true) => {
        try {
            console.log(`Requesting media: video=${video}, audio=${audio}`);
            const currentStream = await navigator.mediaDevices.getUserMedia({ video, audio });
            console.log('Media stream obtained');
            setStream(currentStream);
            if (myVideo.current) myVideo.current.srcObject = currentStream;
            return currentStream;
        } catch (err) {
            console.error("Error accessing media devices:", err);
            return null;
        }
    };

    return (
        <SocketContext.Provider value={{
            call,
            callAccepted,
            myVideo,
            userVideo,
            stream,
            name,
            setName,
            callEnded,
            me,
            callUser,
            leaveCall,
            rejectCall,
            toggleMute,
            isMuted,
            remoteMuted,
            answerCall,
            getMedia,
            user,
            loginUser,
            logoutUser,
            socket,
            isCalling
        }}>
            {children}
        </SocketContext.Provider>
    );
};

export { ContextProvider, SocketContext };
