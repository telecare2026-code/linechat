import { NextRequest, NextResponse } from 'next/server';
import { messagingApi } from '@line/bot-sdk';
import { supabase } from '@/lib/supabase';

const { MessagingApiClient } = messagingApi;

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';

const client = new MessagingApiClient({
    channelAccessToken,
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { customerId, message, adminName } = body;

        if (!customerId || !message) {
            return NextResponse.json({ error: 'Missing customerId or message' }, { status: 400 });
        }

        // 1. Get customer's LINE user ID
        const { data: customer, error: customerError } = await supabase
            .from('customers')
            .select('line_user_id')
            .eq('id', customerId)
            .single();

        if (customerError || !customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        // 2. Send message to LINE
        await client.pushMessage({
            to: customer.line_user_id,
            messages: [{ type: 'text', text: message }],
        });

        // 3. Save message to database
        await supabase.from('messages').insert({
            customer_id: customerId,
            sender_type: 'admin',
            message_type: 'text',
            content: message,
            admin_name: adminName || 'Admin',
        });

        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}
