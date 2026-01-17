import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChatStore } from '@/store/useChatStore';
import { MapPin, Phone, Tag } from 'lucide-react';

export function CustomerProfile() {
    const { selectedChatId, chatSessions } = useChatStore();
    const selectedChat = chatSessions.find(c => c.id === selectedChatId);

    if (!selectedChat) {
        return (
            <div className="flex flex-col h-full bg-slate-50">
                <div className="p-4 border-b font-semibold text-lg">Customer Info</div>
                <div className="flex-1 flex items-center justify-center text-slate-400 p-4 text-center text-sm">
                    Select a chat to view customer details
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-y-auto">
            <div className="p-4 border-b font-semibold text-lg bg-white sticky top-0">Customer Info</div>

            <div className="p-6 flex flex-col items-center border-b bg-white">
                <div className="h-24 w-24 bg-slate-200 rounded-full mb-4 overflow-hidden border-4 border-slate-100 shadow-sm">
                    {selectedChat.avatarUrl && <img src={selectedChat.avatarUrl} className="w-full h-full object-cover" />}
                </div>
                <h2 className="text-xl font-bold text-slate-900">{selectedChat.customerName}</h2>
                <p className="text-sm text-slate-500">LINE User</p>
            </div>

            <div className="p-4 space-y-6">
                {/* Tags */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                        <Tag className="w-4 h-4 mr-2" />
                        Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {selectedChat.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                {tag}
                            </span>
                        ))}
                        <button className="px-2 py-1 border border-dashed border-slate-300 text-slate-400 text-xs rounded-full hover:bg-slate-100">
                            + Add Tag
                        </button>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Real Name</label>
                        <Input defaultValue={selectedChat.customerName} className="bg-white" />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input placeholder="Not set" className="pl-9 bg-white" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pl-9"
                                placeholder="Shipping address..."
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <Button className="w-full" variant="default">Save Changes</Button>
                </div>
            </div>
        </div>
    );
}
