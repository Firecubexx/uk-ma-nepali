import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { getApiOrigin } from '../utils/helpers';

const API = getApiOrigin();

// Singleton socket for online tracking — shared across all hook instances
let _socket = null;
let _listeners = new Set();
let _onlineUsers = [];

function getSharedSocket(userId) {
  if (!_socket) {
    _socket = io(API, { transports: ['websocket'] });
    _socket.on('connect', () => _socket.emit('userOnline', userId));
    _socket.on('onlineUsers', (users) => {
      _onlineUsers = users;
      _listeners.forEach((fn) => fn(users));
    });
  }
  return _socket;
}

/**
 * useOnlineUsers — subscribe to real-time online user list.
 * Uses a singleton socket so only one connection is made app-wide.
 */
export function useOnlineUsers() {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState(_onlineUsers);

  useEffect(() => {
    if (!user) return;
    getSharedSocket(user._id);

    const listener = (users) => setOnlineUsers([...users]);
    _listeners.add(listener);

    return () => _listeners.delete(listener);
  }, [user?._id]);

  const isOnline = (userId) => Boolean(userId && onlineUsers.includes(userId));

  return { onlineUsers, isOnline };
}
