import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChatStore } from '@/store/useChatStore';
import { Send, Image as ImageIcon, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function ChatThread() {
    const { selectedChatId, chatSessions } = useChatStore();
    const selectedChat = chatSessions.find(c => c.id === selectedChatId);

    // Mock Messages for now
    const messages = selectedChatId ? [
        { id: 1, sender: 'customer', text: 'Hello, is this item available?', time: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
        { id: 2, sender: 'admin', adminName: 'Admin Boat', text: 'Yes, it is ready to ship!', time: new Date(Date.now() - 1000 * 60 * 55).toISOString() },
        { id: 3, sender: 'customer', text: 'Great, I will take it.', time: new Date(Date.now() - 1000 * 60 * 5) },
    ] : [];

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
                <div className="flex space-x-2">
                    {/* Actions */}
                </div>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {messages.map((msg: any) => (
                    <div key={msg.id} className={cn("flex w-full", msg.sender === 'admin' ? "justify-end" : "justify-start")}>
                        <div className={cn("max-w-[70%] flex flex-col", msg.sender === 'admin' ? "items-end" : "items-start")}>
                            <div className={cn(
                                "px-4 py-2 rounded-2xl text-sm relative",
                                msg.sender === 'admin'
                                    ? "bg-blue-600 text-white rounded-br-none"
                                    : "bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm"
                            )}>
                                {msg.text}
                            </div>
                            {/* Attribution & Time */}
                            <div className="text-[10px] text-slate-400 mt-1 flex items-center space-x-1">
                                {msg.sender === 'admin' && <span>Sent by {msg.adminName} • </span>}
                                <span>{format(new Date(msg.time), 'HH:mm')}</span>
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
                    />
                    <Button variant="ghost" size="icon" className="text-slate-500 shrink-0">
                        <Smile className="h-5 w-5" />
                    </Button>
                    <Button size="icon" className="bg-blue-600 hover:bg-blue-700 shrink-0">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
