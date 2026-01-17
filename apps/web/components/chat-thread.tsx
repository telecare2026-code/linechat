'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChatStore } from '@/store/useChatStore';
import { supabase } from '@/lib/supabase';
import { Send, Image as ImageIcon, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Message {
    id: number;
    sender_type: string;
    content: string;
    admin_name?: string;
    created_at: string;
}

export function ChatThread() {
    const { selectedChatId, chatSessions } = useChatStore();
    const selectedChat = chatSessions.find(c => c.id === selectedChatId);
    const [inputValue, setInputValue] = useState('');
    const [sending, setSending] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);

    // Fetch messages when chat is selected
    useEffect(() => {
        if (!selectedChatId) {
            setMessages([]);
            return;
        }

        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .eq('customer_id', selectedChatId)
                .order('created_at', { ascending: true });

            if (data) setMessages(data);
        };

        fetchMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel(`messages-${selectedChatId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `customer_id=eq.${selectedChatId}`
            }, (payload) => {
                setMessages(prev => [...prev, payload.new as Message]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedChatId]);

    const handleSend = async () => {
        if (!inputValue.trim() || !selectedChatId || sending) return;

        setSending(true);
        try {
            const res = await fetch('/api/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: selectedChatId,
                    message: inputValue,
                    adminName: 'Admin'
                })
            });

            if (res.ok) {
                setInputValue('');
            } else {
                console.error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!selectedChatId) {
        return (
            <div className="flex-1 flex items-center justify-center text-slate-400 bg-slate-50/50">
                <div className="text-center">
                    <p>Select a conversation to start chatting</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="h-16 border-b flex items-center px-4 justify-between bg-white shrink-0">
                <div className="flex items-center">
                    <div className="h-10 w-10 bg-slate-200 rounded-full mr-3 overflow-hidden">
                        {selectedChat?.avatarUrl && <img src={selectedChat.avatarUrl} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">{selectedChat?.customerName}</h3>
                        <p className="text-xs text-green-600 flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                            Active now
                        </p>
                    </div>
                </div>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex w-full", msg.sender_type === 'admin' ? "justify-end" : "justify-start")}>
                        <div className={cn("max-w-[70%] flex flex-col", msg.sender_type === 'admin' ? "items-end" : "items-start")}>
                            <div className={cn(
                                "px-4 py-2 rounded-2xl text-sm relative",
                                msg.sender_type === 'admin'
                                    ? "bg-blue-600 text-white rounded-br-none"
                                    : "bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm"
                            )}>
                                {msg.content}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1 flex items-center space-x-1">
                                {msg.sender_type === 'admin' && msg.admin_name && <span>Sent by {msg.admin_name} • </span>}
                                <span>{format(new Date(msg.created_at), 'HH:mm')}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-white shrink-0">
                <div className="flex items-center space-x-2 bg-slate-50 border rounded-lg px-2 py-2">
                    <Button variant="ghost" size="icon" className="text-slate-500 shrink-0">
                        <ImageIcon className="h-5 w-5" />
                    </Button>
                    <Input
                        className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
                        placeholder="Type a message..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={sending}
                    />
                    <Button variant="ghost" size="icon" className="text-slate-500 shrink-0">
                        <Smile className="h-5 w-5" />
                    </Button>
                    <Button
                        size="icon"
                        className="bg-blue-600 hover:bg-blue-700 shrink-0"
                        onClick={handleSend}
                        disabled={sending || !inputValue.trim()}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
