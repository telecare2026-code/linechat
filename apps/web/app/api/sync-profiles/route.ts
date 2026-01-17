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
        // Get all customers
        const { data: customers, error } = await supabase
            .from('customers')
            .select('id, line_user_id, display_name');

        if (error || !customers) {
            return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
        }

        let updated = 0;
        let failed = 0;

        for (const customer of customers) {
            try {
                // Fetch profile from LINE
                const profile = await client.getProfile(customer.line_user_id);

                // Update customer in database
                const { error: updateError } = await supabase
                    .from('customers')
                    .update({
                        display_name: profile.displayName,
                        avatar_url: profile.pictureUrl || null
                    })
                    .eq('id', customer.id);

                if (updateError) {
                    console.error(`Failed to update customer ${customer.id}:`, updateError);
                    failed++;
                } else {
                    updated++;
                }
            } catch (profileError) {
                console.error(`Failed to fetch profile for ${customer.line_user_id}:`, profileError);
                failed++;
            }
        }

        return NextResponse.json({
            status: 'ok',
            total: customers.length,
            updated,
            failed
        });
    } catch (error) {
        console.error('Error syncing profiles:', error);
        return NextResponse.json({ error: 'Failed to sync profiles' }, { status: 500 });
    }
}
