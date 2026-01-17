import { NextRequest, NextResponse } from 'next/server';
import { messagingApi, WebhookEvent } from '@line/bot-sdk';
import { supabase } from '@/lib/supabase';

const { MessagingApiClient } = messagingApi;

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';

const client = new MessagingApiClient({
    channelAccessToken,
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const events: WebhookEvent[] = body.events;

        if (!events) {
            return NextResponse.json({ status: 'ok' });
        }

        await Promise.all(
            events.map(async (event) => {
                await handleEvent(event);
            })
        );

        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('Error in webhook:', error);
        return NextResponse.json({ status: 'error' }, { status: 500 });
    }
}

async function handleEvent(event: WebhookEvent) {
    // Handle text messages
    if (event.type !== 'message') {
        return;
    }

    const userId = event.source.userId;
    if (!userId) return;

    // Get message content
    let messageContent = '';
    let messageType = 'text';

    if (event.message.type === 'text') {
        messageContent = event.message.text;
        messageType = 'text';
    } else if (event.message.type === 'image') {
        messageContent = '[Image]';
        messageType = 'image';
    } else if (event.message.type === 'sticker') {
        messageContent = '[Sticker]';
        messageType = 'sticker';
    } else {
        messageContent = `[${event.message.type}]`;
        messageType = event.message.type;
    }

    // 1. Get or Create Customer with REAL profile from LINE
    let { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('line_user_id', userId)
        .single();

    if (!customer) {
        // Fetch real profile from LINE
        let displayName = 'LINE User';
        let avatarUrl = null;

        try {
            const profile = await client.getProfile(userId);
            displayName = profile.displayName;
            avatarUrl = profile.pictureUrl || null;
        } catch (profileError) {
            console.error('Error fetching LINE profile:', profileError);
        }

        const { data: newCustomer, error: insertError } = await supabase
            .from('customers')
            .insert({
                line_user_id: userId,
                display_name: displayName,
                avatar_url: avatarUrl
            })
            .select('id')
            .single();

        if (insertError) {
            console.error('Error creating customer:', insertError);
            return;
        }
        customer = newCustomer;
    }

    // 2. Insert Message
    if (customer && customer.id) {
        const { error: msgError } = await supabase
            .from('messages')
            .insert({
                customer_id: customer.id,
                sender_type: 'customer',
                message_type: messageType,
                content: messageContent,
                payload: event
            });

        if (msgError) console.error('Error insert message:', msgError);
    }
}
