import React from 'react';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { format } from 'date-fns';
import { useChatStore } from '@/store/useChatStore';
import { cn } from '@/lib/utils';

export function ChatList() {
    const { chatSessions, selectedChatId, setSelectedChatId } = useChatStore();

    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const chat = chatSessions[index];
        const isSelected = selectedChatId === chat.id;

        return (
            <div style={style} className="px-2 py-1">
                <button
                    onClick={() => setSelectedChatId(chat.id)}
                    className={cn(
                        "w-full text-left flex items-start p-3 rounded-lg transition-colors",
                        isSelected ? "bg-slate-200" : "hover:bg-slate-100"
                    )}
                >
                    {/* Avatar */}
                    <div className="h-10 w-10 shrink-0 bg-slate-200 rounded-full mr-3 overflow-hidden">
                        {chat.avatarUrl && <img src={chat.avatarUrl} alt="" className="h-full w-full object-cover" />}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                            <span className={cn("font-medium truncate", isSelected ? "text-slate-900" : "text-slate-700")}>
                                {chat.customerName}
                            </span>
                            <span className="text-xs text-slate-400 shrink-0 ml-2">
                                {format(new Date(chat.lastMessageTime), 'HH:mm')}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 truncate pr-4">
                            {chat.lastMessage}
                        </p>
                    </div>

                    {/* Unread Badge */}
                    {chat.unreadCount > 0 && (
                        <div className="ml-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                            {chat.unreadCount}
                        </div>
                    )}
                </button>
            </div>
        );
    };

    return (
        <div className="flex-1">
            <AutoSizer>
                {({ height, width }: { height: number; width: number }) => (
                    <FixedSizeList
                        height={height}
                        itemCount={chatSessions.length}
                        itemSize={80} // Height of each row
                        width={width}
                    >
                        {Row}
                    </FixedSizeList>
                )}
            </AutoSizer>
        </div>
    );
}
