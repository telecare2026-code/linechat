import { NextRequest, NextResponse } from 'next/server';
import { messagingApi, WebhookEvent } from '@line/bot-sdk';
import { supabase } from '@/lib/supabase';

const { MessagingApiClient } = messagingApi;

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
// const channelSecret = process.env.LINE_CHANNEL_SECRET || ''; // Used for signature validation

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
    if (event.type !== 'message' || event.message.type !== 'text') {
        return;
    }

    const userId = event.source.userId;
    const text = event.message.text;

    if (!userId) return;

    // 1. Get or Create Customer
    // We use simple upsert logic. In real app, might want to fetch profile from LINE first.
    let { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('line_user_id', userId)
        .single();

    if (!customer) {
        const { data: newCustomer, error: insertError } = await supabase
            .from('customers')
            .insert({
                line_user_id: userId,
                display_name: `User ${userId.substring(0, 4)}`
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
                message_type: 'text',
                content: text,
                payload: event
            });

        if (msgError) console.error('Error insert message:', msgError);
    }
}
