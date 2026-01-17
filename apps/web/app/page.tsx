'use client';

import { useEffect } from 'react';
import { ChatLayout, ChatSidebar, ChatMain, ChatRightPanel } from '@/components/chat-layout';
import { Button } from '@/components/ui/button';
import { ChatList } from '@/components/chat-list';
import { ChatThread } from '@/components/chat-thread';
import { CustomerProfile } from '@/components/customer-profile';
import { supabase } from '@/lib/supabase';
import { useChatStore } from '@/store/useChatStore';

export default function Home() {
  const { setChatSessions } = useChatStore();

  useEffect(() => {
    // 1. Fetch initial chats
    const fetchChats = async () => {
      const { data: customers } = await supabase
        .from('customers')
        .select('*, messages(content, created_at)')
        .order('created_at', { ascending: false });

      if (customers) {
        const sessions = customers.map((c: any) => ({
          id: c.id.toString(),
          customerName: c.display_name,
          lastMessage: c.messages?.[0]?.content || 'No messages',
          lastMessageTime: c.messages?.[0]?.created_at || c.created_at,
          unreadCount: 0,
          avatarUrl: c.avatar_url,
          tags: []
        }));
        setChatSessions(sessions);
      }
    };

    fetchChats();

    // 2. Subscribe to new messages
    const channel = supabase
      .channel('realtime messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        console.log('New message:', payload);
        fetchChats(); // Refresh list on new message
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <ChatLayout>
      <ChatSidebar className="border-r">
        <div className="p-4 border-b font-semibold text-lg flex justify-between items-center">
          <span>Chats</span>
          <Button variant="ghost" size="icon" className="h-8 w-8">+</Button>
        </div>
        <ChatList />
      </ChatSidebar>

      <ChatMain>
        <ChatThread />
      </ChatMain>

      <ChatRightPanel>
        <CustomerProfile />
      </ChatRightPanel>
    </ChatLayout>
  );
}
