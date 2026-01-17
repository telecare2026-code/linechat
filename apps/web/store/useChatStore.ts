import { create } from 'zustand';

export interface ChatSession {
    id: string;
    customerName: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    avatarUrl?: string;
    tags: string[];
}

interface ChatState {
    currentUser: any | null;
    chatSessions: ChatSession[];
    selectedChatId: string | null;
}

interface ChatActions {
    setCurrentUser: (user: any) => void;
    setChatSessions: (sessions: ChatSession[]) => void;
    setSelectedChatId: (id: string | null) => void;
}

// Mock Data (Fallback)
const MOCK_CHATS: ChatSession[] = [];

export const useChatStore = create<ChatState & ChatActions>((set) => ({
    currentUser: null,
    chatSessions: MOCK_CHATS,
    selectedChatId: null,
    setCurrentUser: (user) => set({ currentUser: user }),
    setChatSessions: (sessions) => set({ chatSessions: sessions }),
    setSelectedChatId: (id) => set({ selectedChatId: id }),
}));
