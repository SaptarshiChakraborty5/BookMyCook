import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Message } from '../types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (data: { receiverId: string; content: string; bookingId?: string }) => void;
  onNewMessage: (callback: (message: Message) => void) => void;
  onTyping: (callback: (data: { userId: string }) => void) => void;
  emitTyping: (receiverId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      // Connect to socket server
      const socketInstance = io('http://localhost:8000');
      
      socketInstance.on('connect', () => {
        setIsConnected(true);
        console.log('Socket connected');
        // Authenticate socket with token
        socketInstance.emit('authenticate', token);
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
        console.log('Socket disconnected');
      });

      socketInstance.on('error', (error) => {
        console.error('Socket error:', error);
      });

      setSocket(socketInstance);

      // Cleanup on unmount
      return () => {
        socketInstance.disconnect();
      };
    }
  }, [isAuthenticated, token]);

  const sendMessage = (data: { receiverId: string; content: string; bookingId?: string }) => {
    if (socket && isConnected) {
      socket.emit('send_message', data);
    }
  };

  const onNewMessage = (callback: (message: Message) => void) => {
    if (socket) {
      socket.on('new_message', callback);
    }
  };

  const onTyping = (callback: (data: { userId: string }) => void) => {
    if (socket) {
      socket.on('user_typing', callback);
    }
  };

  const emitTyping = (receiverId: string) => {
    if (socket && isConnected) {
      socket.emit('typing', { receiverId });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        sendMessage,
        onNewMessage,
        onTyping,
        emitTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};