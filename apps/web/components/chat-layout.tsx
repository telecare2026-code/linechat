import React from 'react';
import { cn } from '@/lib/utils';

interface ChatLayoutProps {
    children: React.ReactNode;
}

export function ChatLayout({ children }: ChatLayoutProps) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-white">
            {children}
        </div>
    );
}

export function ChatSidebar({ className, children }: { className?: string, children: React.ReactNode }) {
    return (
        <aside className={cn("flex w-80 flex-col border-r border-slate-200 bg-slate-50", className)}>
            {children}
        </aside>
    );
}

export function ChatMain({ className, children }: { className?: string, children: React.ReactNode }) {
    return (
        <main className={cn("flex flex-1 flex-col overflow-hidden", className)}>
            {children}
        </main>
    );
}

export function ChatRightPanel({ className, children }: { className?: string, children: React.ReactNode }) {
    return (
        <aside className={cn("flex w-80 flex-col border-l border-slate-200 bg-slate-50", className)}>
            {children}
        </aside>
    );
}
