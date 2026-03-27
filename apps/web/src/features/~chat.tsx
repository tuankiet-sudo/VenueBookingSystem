import { createFileRoute, redirect } from '@tanstack/react-router';
import {
  Send,
  Search,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  MessageSquare,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

import { Footer } from '@/components/booking-footer';
import { Header } from '@/components/booking-header';

export const Route = createFileRoute('/chat')({
  beforeLoad: ({ context }) => {
    if (!context.authContext.isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
  component: ChatPage,
});

// --- Types ---
interface User {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image';
}

interface Conversation {
  id: string;
  participant: User;
  lastMessage: Message;
  unreadCount: number;
}

// --- Mock Data ---
const CURRENT_USER_ID = 'me';

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    participant: {
      id: 'u1',
      name: 'Luxury Ocean Villa',
      status: 'online',
      avatar:
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=100',
    },
    lastMessage: {
      id: 'm1',
      senderId: 'u1',
      content: 'We look forward to hosting you!',
      timestamp: '2024-03-15T10:30:00',
      status: 'read',
      type: 'text',
    },
    unreadCount: 2,
  },
  {
    id: 'c2',
    participant: {
      id: 'u2',
      name: 'Downtown Loft Support',
      status: 'offline',
      lastSeen: '2 hours ago',
    },
    lastMessage: {
      id: 'm2',
      senderId: 'me',
      content: 'Is early check-in available?',
      timestamp: '2024-03-14T15:45:00',
      status: 'delivered',
      type: 'text',
    },
    unreadCount: 0,
  },
  {
    id: 'c3',
    participant: {
      id: 'u3',
      name: 'Mountain Retreat Owner',
      status: 'away',
    },
    lastMessage: {
      id: 'm3',
      senderId: 'u3',
      content: 'The key code is 1234.',
      timestamp: '2024-03-10T09:00:00',
      status: 'read',
      type: 'text',
    },
    unreadCount: 0,
  },
  {
    id: 'c4',
    participant: {
      id: 'u4',
      name: 'City Center Apartment',
      status: 'online',
    },
    lastMessage: {
      id: 'm4',
      senderId: 'u4',
      content: 'Please let me know your arrival time.',
      timestamp: '2024-03-09T14:20:00',
      status: 'read',
      type: 'text',
    },
    unreadCount: 1,
  },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  c1: [
    {
      id: 'm1-1',
      senderId: 'me',
      content: 'Hi, I have a question about the pool.',
      timestamp: '2024-03-15T10:00:00',
      status: 'read',
      type: 'text',
    },
    {
      id: 'm1-2',
      senderId: 'u1',
      content: 'Hello! Sure, what would you like to know?',
      timestamp: '2024-03-15T10:05:00',
      status: 'read',
      type: 'text',
    },
    {
      id: 'm1-3',
      senderId: 'me',
      content: 'Is it heated?',
      timestamp: '2024-03-15T10:10:00',
      status: 'read',
      type: 'text',
    },
    {
      id: 'm1-4',
      senderId: 'u1',
      content: 'Yes, the pool is heated to 28°C year-round.',
      timestamp: '2024-03-15T10:15:00',
      status: 'read',
      type: 'text',
    },
    {
      id: 'm1-5',
      senderId: 'u1',
      content: 'We look forward to hosting you!',
      timestamp: '2024-03-15T10:30:00',
      status: 'read',
      type: 'text',
    },
  ],
  c2: [
    {
      id: 'm2-1',
      senderId: 'me',
      content: 'Is early check-in available?',
      timestamp: '2024-03-14T15:45:00',
      status: 'delivered',
      type: 'text',
    },
  ],
  c3: [
    {
      id: 'm3-1',
      senderId: 'u3',
      content: 'The key code is 1234.',
      timestamp: '2024-03-10T09:00:00',
      status: 'read',
      type: 'text',
    },
  ],
  c4: [
    {
      id: 'm4-1',
      senderId: 'u4',
      content: 'Please let me know your arrival time.',
      timestamp: '2024-03-09T14:20:00',
      status: 'read',
      type: 'text',
    },
  ],
};

// --- Components ---

function ChatPage() {
  const [conversations, setConversations] =
    useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(MOCK_CONVERSATIONS[0]?.id ?? null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeConversationId) {
      setMessages(MOCK_MESSAGES[activeConversationId] || []);
      // Mark as read logic would go here
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId ? { ...c, unreadCount: 0 } : c,
        ),
      );
    }
  }, [activeConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !activeConversationId) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: CURRENT_USER_ID,
      content: newMessage,
      timestamp: new Date().toISOString(),
      status: 'sent',
      type: 'text',
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage('');

    // Update last message in conversation list
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId ? { ...c, lastMessage: message } : c,
      ),
    );

    // Simulate reply
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        senderId:
          conversations.find((c) => c.id === activeConversationId)?.participant
            .id || 'unknown',
        content: 'This is an automated reply mock.',
        timestamp: new Date().toISOString(),
        status: 'read',
        type: 'text',
      };
      setMessages((prev) => [...prev, reply]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId ? { ...c, lastMessage: reply } : c,
        ),
      );
    }, 2000);
  };

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main
        className="flex flex-1 overflow-hidden"
        style={{ height: 'calc(100vh - 64px)' }}
      >
        <div className="container-custom flex h-full flex-1 gap-6 py-6">
          {/* Sidebar - Conversation List */}
          <div className="flex size-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg md:w-80 lg:w-96">
            {/* Sidebar Header */}
            <div className="z-10 border-b border-gray-100 bg-white p-4">
              <h2 className="mb-4 text-xl font-bold text-gray-900">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="w-full rounded-lg bg-gray-50 py-2 pl-9 pr-4 text-sm outline-none ring-2 ring-transparent transition-all focus:bg-white focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className=" flex-1 overflow-y-auto p-2">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setActiveConversationId(conversation.id)}
                  className={`mb-1 flex w-full items-center gap-3 rounded-xl p-3 transition-all hover:bg-gray-50 ${
                    activeConversationId === conversation.id
                      ? 'bg-blue-50 ring-1 ring-blue-100'
                      : ''
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="size-12 overflow-hidden rounded-full bg-gray-200">
                      {conversation.participant.avatar ? (
                        <img
                          src={conversation.participant.avatar}
                          alt={conversation.participant.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold text-white">
                          {conversation.participant.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    {conversation.participant.status === 'online' && (
                      <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-green-500" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 overflow-hidden text-left">
                    <div className="flex items-center justify-between">
                      <h3 className="truncate font-semibold text-gray-900">
                        {conversation.participant.name}
                      </h3>
                      <span className="ml-2 shrink-0 text-xs text-gray-400">
                        {new Date(
                          conversation.lastMessage.timestamp,
                        ).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <p
                        className={`truncate text-sm ${
                          conversation.unreadCount > 0
                            ? 'font-medium text-gray-900'
                            : 'text-gray-500'
                        }`}
                      >
                        {conversation.lastMessage.senderId ===
                          CURRENT_USER_ID && 'You: '}
                        {conversation.lastMessage.content}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="ml-2 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="hidden h-full flex-1 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg md:flex">
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="z-10 flex items-center justify-between border-b border-gray-100 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="size-10 overflow-hidden rounded-full bg-gray-200">
                        {activeConversation.participant.avatar ? (
                          <img
                            src={activeConversation.participant.avatar}
                            alt={activeConversation.participant.name}
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
                            {activeConversation.participant.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      {activeConversation.participant.status === 'online' && (
                        <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white bg-green-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {activeConversation.participant.name}
                      </h3>
                      <p className="text-xs text-green-600">
                        {activeConversation.participant.status === 'online'
                          ? 'Online'
                          : activeConversation.participant.lastSeen ||
                            'Offline'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-primary">
                      <Phone className="size-5" />
                    </button>
                    <button className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-primary">
                      <Video className="size-5" />
                    </button>
                    <button className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600">
                      <MoreVertical className="size-5" />
                    </button>
                  </div>
                </div>

                {/* Messages Area */}
                <div className=" flex-1 overflow-y-auto bg-gray-50/50 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isMe = message.senderId === CURRENT_USER_ID;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                              isMe
                                ? 'rounded-tr-none bg-primary text-white'
                                : 'rounded-tl-none bg-white text-gray-800'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div
                              className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                                isMe ? 'text-blue-100' : 'text-gray-400'
                              }`}
                            >
                              <span>
                                {new Date(message.timestamp).toLocaleTimeString(
                                  [],
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  },
                                )}
                              </span>
                              {isMe && (
                                <span>
                                  {message.status === 'read' ? (
                                    <CheckCheck className="size-3" />
                                  ) : (
                                    <Check className="size-3" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Input Area */}
                <div className="z-10 border-t border-gray-100 bg-white p-4">
                  <form
                    onSubmit={handleSendMessage}
                    className="flex items-center gap-2 rounded-xl bg-gray-50 p-2 ring-1 ring-gray-200 focus-within:ring-2 focus-within:ring-primary/20"
                  >
                    <button
                      type="button"
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                    >
                      <Paperclip className="size-5" />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                    >
                      <Smile className="size-5" />
                    </button>
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="rounded-lg bg-primary p-2 text-white shadow-sm transition-all hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send className="size-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-full bg-blue-50 p-6">
                  <MessageSquare className="size-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Select a Conversation
                </h3>
                <p className="mt-2 text-gray-500">
                  Choose a conversation from the sidebar to start chatting
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
