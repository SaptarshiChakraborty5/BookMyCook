import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getMessages, sendMessage, markMessagesAsRead } from '../api';
import { Message } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Send, AlertCircle } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { socket, onNewMessage, sendMessage: socketSendMessage, emitTyping } = useSocket();
  
  // Get receiverId and receiverName from location state (if navigated from booking or chef details)
  const initialReceiverId = location.state?.receiverId || '';
  const initialReceiverName = location.state?.receiverName || '';
  const bookingId = location.state?.bookingId || '';

  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Initialize with the contact from navigation if available
  useEffect(() => {
    if (initialReceiverId && initialReceiverName) {
      setActiveContact({
        id: initialReceiverId,
        name: initialReceiverName,
        unreadCount: 0
      });
    }
  }, [initialReceiverId, initialReceiverName]);
  
  // Fetch all messages to build contact list
  useEffect(() => {
    const fetchAllMessages = async () => {
      try {
        setLoading(true);
        const response = await getMessages();
        
        // Build contact list from messages
        const contactsMap = new Map<string, Contact>();
        
        response.data.forEach((msg: Message) => {
          const isIncoming = typeof msg.senderId === 'object' 
            ? msg.senderId.id !== user?.id 
            : msg.senderId !== user?.id;
          
          const contactId = isIncoming 
            ? (typeof msg.senderId === 'object' ? msg.senderId.id : msg.senderId)
            : (typeof msg.receiverId === 'object' ? msg.receiverId.id : msg.receiverId);
          
          const contactName = isIncoming
            ? (typeof msg.senderId === 'object' ? msg.senderId.name : 'Contact')
            : (typeof msg.receiverId === 'object' ? msg.receiverId.name : 'Contact');
          
          if (contactId === user?.id) return; // Skip messages to self
          
          if (!contactsMap.has(contactId)) {
            contactsMap.set(contactId, {
              id: contactId,
              name: contactName,
              lastMessage: msg.content,
              lastMessageTime: msg.timestamp,
              unreadCount: isIncoming && !msg.read ? 1 : 0
            });
          } else {
            const contact = contactsMap.get(contactId)!;
            const msgTime = new Date(msg.timestamp).getTime();
            const lastMsgTime = contact.lastMessageTime 
              ? new Date(contact.lastMessageTime).getTime() 
              : 0;
            
            if (msgTime > lastMsgTime) {
              contact.lastMessage = msg.content;
              contact.lastMessageTime = msg.timestamp;
            }
            
            if (isIncoming && !msg.read) {
              contact.unreadCount += 1;
            }
            
            contactsMap.set(contactId, contact);
          }
        });
        
        setContacts(Array.from(contactsMap.values()));
        
        // If activeContact is set (from navigation), load messages for that contact
        if (activeContact) {
          loadMessagesForContact(activeContact.id);
        } else if (contactsMap.size > 0 && !initialReceiverId) {
          // Auto-select first contact if none is active and we weren't given an initial receiver
          const firstContact = Array.from(contactsMap.values())[0];
          setActiveContact(firstContact);
          loadMessagesForContact(firstContact.id);
        } else {
          setLoading(false);
        }
        
      } catch (err) {
        setError('Failed to load messages. Please try again later.');
        setLoading(false);
      }
    };

    fetchAllMessages();
  }, [user?.id]);
  
  // Setup socket listener for new messages
  useEffect(() => {
    if (socket) {
      onNewMessage((newMessage) => {
        // Update messages if from active contact
        const isFromActiveContact = 
          activeContact && 
          (typeof newMessage.senderId === 'object' 
            ? newMessage.senderId.id === activeContact.id 
            : newMessage.senderId === activeContact.id);
        
        if (isFromActiveContact) {
          setMessages(prevMessages => [...prevMessages, newMessage]);
          // Mark as read
          markMessagesAsRead([newMessage.messageId]);
        }
        
        // Update contacts
        updateContactWithNewMessage(newMessage);
      });
    }
    
    return () => {
      // Cleanup if needed
    };
  }, [socket, activeContact]);
  
  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const updateContactWithNewMessage = (newMessage: Message) => {
    const isIncoming = typeof newMessage.senderId === 'object' 
      ? newMessage.senderId.id !== user?.id 
      : newMessage.senderId !== user?.id;
    
    const contactId = isIncoming 
      ? (typeof newMessage.senderId === 'object' ? newMessage.senderId.id : newMessage.senderId)
      : (typeof newMessage.receiverId === 'object' ? newMessage.receiverId.id : newMessage.receiverId);
    
    const contactName = isIncoming
      ? (typeof newMessage.senderId === 'object' ? newMessage.senderId.name : 'Contact')
      : (typeof newMessage.receiverId === 'object' ? newMessage.receiverId.name : 'Contact');
    
    setContacts(prevContacts => {
      const contactIndex = prevContacts.findIndex(c => c.id === contactId);
      
      if (contactIndex >= 0) {
        // Update existing contact
        const updatedContacts = [...prevContacts];
        updatedContacts[contactIndex] = {
          ...updatedContacts[contactIndex],
          lastMessage: newMessage.content,
          lastMessageTime: newMessage.timestamp,
          unreadCount: isIncoming && !newMessage.read 
            ? updatedContacts[contactIndex].unreadCount + 1 
            : updatedContacts[contactIndex].unreadCount
        };
        return updatedContacts;
      } else {
        // Add new contact
        return [
          {
            id: contactId,
            name: contactName,
            lastMessage: newMessage.content,
            lastMessageTime: newMessage.timestamp,
            unreadCount: isIncoming && !newMessage.read ? 1 : 0
          },
          ...prevContacts
        ];
      }
    });
  };
  
  const loadMessagesForContact = async (contactId: string) => {
    try {
      setLoading(true);
      const response = await getMessages({ withUser: contactId });
      setMessages(response.data);
      
      // Mark messages as read
      const unreadMessageIds = response.data
        .filter((msg: Message) => 
          !msg.read && 
          (typeof msg.senderId === 'object' 
            ? msg.senderId.id === contactId 
            : msg.senderId === contactId)
        )
        .map((msg: Message) => msg._id);
      
      if (unreadMessageIds.length > 0) {
        await markMessagesAsRead(unreadMessageIds);
        
        // Update unread count in contacts
        setContacts(prevContacts => 
          prevContacts.map(contact => 
            contact.id === contactId 
              ? { ...contact, unreadCount: 0 } 
              : contact
          )
        );
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load messages. Please try again later.');
      setLoading(false);
    }
  };
  
  const handleContactSelect = (contact: Contact) => {
    setActiveContact(contact);
    loadMessagesForContact(contact.id);
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !activeContact) return;
    
    try {
      setSendingMessage(true);
      
      const messageData = {
        receiverId: activeContact.id,
        content: messageInput,
        ...(bookingId ? { bookingId } : {})
      };
      
      // Send via socket for real-time
      socketSendMessage(messageData);
      
      // Also send via API for persistence
      const response = await sendMessage(messageData);
      
      // Add to messages
      setMessages(prevMessages => [...prevMessages, response.data.messageData]);
      
      // Update contact
      updateContactWithNewMessage(response.data.messageData);
      
      // Clear input
      setMessageInput('');
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex h-[calc(100vh-64px)]">
          {/* Contacts Sidebar */}
          <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {contacts.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No conversations yet
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {contacts.map((contact) => (
                    <li key={contact.id}>
                      <button
                        onClick={() => handleContactSelect(contact)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start ${
                          activeContact?.id === contact.id ? 'bg-gray-100' : ''
                        }`}
                      >
                        {/* Avatar placeholder */}
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                          {contact.name.charAt(0)}
                        </div>
                        
                        <div className="ml-3 flex-1 overflow-hidden">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
                            {contact.lastMessageTime && (
                              <p className="text-xs text-gray-500">
                                {formatTime(contact.lastMessageTime)}
                              </p>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
                        </div>
                        
                        {contact.unreadCount > 0 && (
                          <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-emerald-600 rounded-full">
                            {contact.unreadCount}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          {/* Messages Area */}
          <div className="hidden md:flex flex-1 flex-col bg-gray-100">
            {activeContact ? (
              <>
                {/* Chat header */}
                <div className="bg-white border-b border-gray-200 p-4 flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                    {activeContact.name.charAt(0)}
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">{activeContact.name}</h3>
                </div>
                
                {/* Messages */}
                <div 
                  ref={chatContainerRef}
                  className="flex-1 p-4 overflow-y-auto"
                >
                  {loading ? (
                    <LoadingSpinner />
                  ) : error ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
                        <p className="mt-2 text-gray-500">{error}</p>
                        <button
                          onClick={() => loadMessagesForContact(activeContact.id)}
                          className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <p className="text-gray-500">No messages yet</p>
                        <p className="mt-1 text-sm text-gray-400">Send a message to start a conversation</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message, index) => {
                        const isCurrentUser = typeof message.senderId === 'object' 
                          ? message.senderId.id === user?.id 
                          : message.senderId === user?.id;
                        
                        const showDate = index === 0 || 
                          formatMessageDate(messages[index-1].timestamp) !== formatMessageDate(message.timestamp);
                          
                        return (
                          <div key={message._id}>
                            {showDate && (
                              <div className="flex justify-center my-4">
                                <span className="px-2 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                                  {formatMessageDate(message.timestamp)}
                                </span>
                              </div>
                            )}
                            <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                              <div 
                                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                  isCurrentUser 
                                    ? 'bg-emerald-600 text-white' 
                                    : 'bg-white text-gray-800 border border-gray-200'
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <p className={`text-xs mt-1 ${isCurrentUser ? 'text-emerald-100' : 'text-gray-500'}`}>
                                  {formatTime(message.timestamp)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
                
                {/* Message Input */}
                <div className="bg-white border-t border-gray-200 p-4">
                  <form onSubmit={handleSendMessage} className="flex">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => {
                        setMessageInput(e.target.value);
                        emitTyping(activeContact.id);
                      }}
                      placeholder="Type a message..."
                      className="flex-1 rounded-l-md border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={!messageInput.trim() || sendingMessage}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Send</span>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-gray-500">Select a conversation</p>
                  <p className="mt-1 text-sm text-gray-400">Choose a contact to view messages</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Mobile message view (shown when contact is selected) */}
          {activeContact && (
            <div className="fixed inset-0 z-10 md:hidden bg-gray-100 flex flex-col">
              <div className="bg-white border-b border-gray-200 p-4 flex items-center">
                <button
                  onClick={() => setActiveContact(null)}
                  className="mr-3 text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                  {activeContact.name.charAt(0)}
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900">{activeContact.name}</h3>
              </div>
              
              {/* Messages */}
              <div 
                ref={chatContainerRef}
                className="flex-1 p-4 overflow-y-auto"
              >
                {loading ? (
                  <LoadingSpinner />
                ) : error ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
                      <p className="mt-2 text-gray-500">{error}</p>
                      <button
                        onClick={() => loadMessagesForContact(activeContact.id)}
                        className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-gray-500">No messages yet</p>
                      <p className="mt-1 text-sm text-gray-400">Send a message to start a conversation</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => {
                      const isCurrentUser = typeof message.senderId === 'object' 
                        ? message.senderId.id === user?.id 
                        : message.senderId === user?.id;
                      
                      const showDate = index === 0 || 
                        formatMessageDate(messages[index-1].timestamp) !== formatMessageDate(message.timestamp);
                        
                      return (
                        <div key={message._id}>
                          {showDate && (
                            <div className="flex justify-center my-4">
                              <span className="px-2 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                                {formatMessageDate(message.timestamp)}
                              </span>
                            </div>
                          )}
                          <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            <div 
                              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                isCurrentUser 
                                  ? 'bg-emerald-600 text-white' 
                                  : 'bg-white text-gray-800 border border-gray-200'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${isCurrentUser ? 'text-emerald-100' : 'text-gray-500'}`}>
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              
              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <form onSubmit={handleSendMessage} className="flex">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value);
                      emitTyping(activeContact.id);
                    }}
                    placeholder="Type a message..."
                    className="flex-1 rounded-l-md border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim() || sendingMessage}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;