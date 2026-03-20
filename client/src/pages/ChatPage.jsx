import { usePageTitle } from '../hooks/usePageTitle';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiSend, FiArrowLeft, FiSearch } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';
import { SpinnerPage, EmptyState } from '../components/common/UI';
import Avatar from '../components/common/Avatar';
import { useAuth } from '../context/AuthContext';
import { useOnlineUsers } from '../hooks/useOnlineUsers';
import api from '../utils/api';

// Helper to make a room ID matching the server
const getRoomId = (id1, id2) => [id1, id2].sort().join('_');

export default function ChatPage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isOnline } = useOnlineUsers();
  usePageTitle('Messages');
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages]           = useState([]);
  const [chatPartner, setChatPartner]     = useState(null);
  const [text, setText]     = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const socket = useSocket(); // shared context socket
  const [typing, setTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeout  = useRef(null);

  // Load conversations
  useEffect(() => {
    api.get('/messages/conversations')
      .then(({ data }) => setConversations(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Load messages when userId changes
  useEffect(() => {
    if (!userId) return;
    setLoadingMsgs(true);
    api.get(`/messages/${userId}`)
      .then(({ data }) => {
        setMessages(data);
        // Find partner info from conversations
        const conv = conversations.find((c) => c.partner?._id === userId);
        if (conv) setChatPartner(conv.partner);
        else api.get(`/users/${userId}`).then(({ data: u }) => setChatPartner(u)).catch(() => {});
      })
      .catch(() => toast.error('Failed to load messages'))
      .finally(() => setLoadingMsgs(false));
  }, [userId]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !userId) return;
    const roomId = getRoomId(user._id, userId);
    socket.emit('joinRoom', roomId);

    socket.on('newMessage', (msg) => {
      if (msg.roomId === roomId) setMessages((prev) => [...prev, msg]);
    });
    socket.on('userTyping', (data) => {
      if (data.userId === userId) setTyping(true);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setTyping(false), 2000);
    });

    return () => { socket.off('newMessage'); socket.off('userTyping'); };
  }, [socket, userId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const roomId = getRoomId(user._id, userId);
    const msgData = { roomId, sender: user, receiver: { _id: userId }, text, createdAt: new Date() };
    setMessages((prev) => [...prev, msgData]);
    setText('');
    try {
      await api.post(`/messages/${userId}`, { text });
      socket?.emit('sendMessage', msgData);
    } catch { toast.error('Failed to send'); }
  };

  const handleTyping = () => {
    if (!socket || !userId) return;
    socket.emit('typing', { roomId: getRoomId(user._id, userId), userId: user._id });
  };

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    try {
      const { data } = await api.get(`/users/search/query?q=${q}`);
      setSearchResults(data);
    } catch {}
  };

  if (loading) return <SpinnerPage />;

  return (
    <div className="flex gap-0 h-[calc(100vh-120px)] lg:h-[calc(100vh-48px)] -mx-4 -my-6">
      {/* Sidebar: conversations */}
      <div className={`${userId ? 'hidden sm:flex' : 'flex'} flex-col w-full sm:w-72 lg:w-80 border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900`}>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-3">Messages 💬</h2>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              placeholder="Search people..."
              className="input-field pl-9 text-sm py-2"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          {searchResults.length > 0 && (
            <div className="mt-2 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
              {searchResults.map((u) => (
                <button
                  key={u._id}
                  onClick={() => { navigate(`/chat/${u._id}`); setSearchQuery(''); setSearchResults([]); }}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 w-full transition-colors"
                >
                  <Avatar src={u.avatar} name={u.name} size="sm" />
                  <div className="text-left min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{u.name}</p>
                    <p className="text-xs text-gray-400 truncate">{u.location}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">
              <p className="text-3xl mb-2">💬</p>
              No conversations yet.<br />Search for someone to chat!
            </div>
          ) : (
            conversations.map((conv) => (
              <Link
                key={conv.partner?._id}
                to={`/chat/${conv.partner?._id}`}
                className={`flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800 ${userId === conv.partner?._id ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
              >
                <Avatar src={conv.partner?.avatar} name={conv.partner?.name || '?'} size="sm" online={isOnline(conv.partner?._id)} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{conv.partner?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{conv.lastMessage?.text}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(conv.lastMessage?.createdAt || Date.now()), { addSuffix: false })}</p>
                  {conv.unread > 0 && (
                    <span className="inline-block bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mt-1">{conv.unread}</span>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Chat window */}
      {userId ? (
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950">
          {/* Chat header */}
          <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
            <Link to="/chat" className="sm:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
              <FiArrowLeft size={18} />
            </Link>
            {chatPartner && (
              <>
                <Avatar src={chatPartner.avatar} name={chatPartner.name} size="sm" online={isOnline(chatPartner._id)} />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{chatPartner.name}</p>
                  {typing ? (
                    <p className="text-xs text-primary-500 animate-pulse">typing...</p>
                  ) : isOnline(chatPartner._id) ? (
                    <p className="text-xs text-green-500 font-medium">● Online</p>
                  ) : (
                    <p className="text-xs text-gray-400">{chatPartner.location}</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loadingMsgs ? <SpinnerPage /> : messages.map((msg, i) => {
              const isMine = msg.sender?._id === user._id || msg.sender === user._id;
              return (
                <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'} fade-in`}>
                  {!isMine && <Avatar src={chatPartner?.avatar} name={chatPartner?.name || '?'} size="xs" className="mr-2 mt-1 shrink-0" />}
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMine
                      ? 'bg-primary-500 text-white rounded-br-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm rounded-bl-sm'
                  }`}>
                    <p>{msg.text}</p>
                    <p className={`text-xs mt-1 ${isMine ? 'text-primary-100' : 'text-gray-400'}`}>
                      {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-3">
            <input
              value={text}
              onChange={(e) => { setText(e.target.value); handleTyping(); }}
              placeholder="Type a message..."
              className="flex-1 input-field py-2.5"
            />
            <button type="submit" disabled={!text.trim()} className="btn-primary px-4 py-2.5">
              <FiSend size={18} />
            </button>
          </form>
        </div>
      ) : (
        <div className="hidden sm:flex flex-1 items-center justify-center text-center bg-gray-50 dark:bg-gray-950">
          <div>
            <p className="text-5xl mb-3">💬</p>
            <h3 className="font-bold text-gray-700 dark:text-gray-300 text-lg">Select a conversation</h3>
            <p className="text-gray-400 text-sm">or search for someone to start chatting</p>
          </div>
        </div>
      )}
    </div>
  );
}
