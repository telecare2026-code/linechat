'use client';

import { useEffect, useState } from 'react';
import { ChatLayout, ChatSidebar, ChatMain, ChatRightPanel } from '@/components/chat-layout';
import { Button } from '@/components/ui/button';
import { ChatList } from '@/components/chat-list';
import { ChatThread } from '@/components/chat-thread';
import { CustomerProfile } from '@/components/customer-profile';
import { supabase } from '@/lib/supabase';
import { useChatStore } from '@/store/useChatStore';
import { RefreshCw } from 'lucide-react';

export default function Home() {
  const { setChatSessions } = useChatStore();
  const [syncing, setSyncing] = useState(false);

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

  const handleSyncProfiles = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/sync-profiles', { method: 'POST' });
      const data = await res.json();
      console.log('Sync result:', data);
      await fetchChats(); // Refresh after sync
      alert(`Sync สำเร็จ! อัพเดท ${data.updated} รายการ`);
    } catch (error) {
      console.error('Sync error:', error);
      alert('เกิดข้อผิดพลาดในการ Sync');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchChats();

    // Subscribe to new messages
    const channel = supabase
      .channel('realtime messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        console.log('New message:', payload);
        fetchChats();
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
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleSyncProfiles}
              disabled={syncing}
              title="Sync Profiles"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">+</Button>
          </div>
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
