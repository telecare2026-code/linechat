import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { middleware, WebhookEvent } from '@line/bot-sdk';
import { lineConfig } from '../lib/line';
import { Client } from 'pg';

// Database connection (Simple version, ideally use a pool from plugins)
const db = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
db.connect().catch(err => console.error('DB Connection Error:', err));

export async function webhookRoutes(fastify: FastifyInstance) {

    // LINE Middleware to validate signature
    // Note: handling middleware in Fastify with @line/bot-sdk can be tricky, 
    // often we use a raw body parser. For simplicity now, we trust the logic or use manual validation if needed.
    // But @line/bot-sdk middleware is for Express. We might need manual signature validation.

    fastify.post('/webhook', async (req: FastifyRequest, reply: FastifyReply) => {
        const events = (req.body as any).events as WebhookEvent[];

        if (!events) {
            return reply.status(200).send('OK');
        }

        // Process events asynchronously (Fire and Forget to prevent timeout)
        events.map(async (event) => {
            try {
                await handleEvent(event);
            } catch (err) {
                console.error('Error handling event:', err);
            }
        });

        return reply.status(200).send('OK');
    });
}

async function handleEvent(event: WebhookEvent) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return;
    }

    const userId = event.source.userId;
    const text = event.message.text;
    const replyToken = event.replyToken;

    if (!userId) return;

    // 1. Upsert Customer
    // On conflict, update display name if we had the API to fetch it (later)
    // For now just ensure user exists
    const userRes = await db.query(`
        INSERT INTO customers (line_user_id, display_name)
        VALUES ($1, $2)
        ON CONFLICT (line_user_id) DO UPDATE SET line_user_id = EXCLUDED.line_user_id
        RETURNING id
    `, [userId, `User ${userId.substring(0, 4)}`]);

    const customerId = userRes.rows[0].id;

    // 2. Save Message
    await db.query(`
        INSERT INTO messages (customer_id, sender_type, message_type, content, payload)
        VALUES ($1, 'customer', 'text', $2, $3)
    `, [customerId, text, JSON.stringify(event)]);

    console.log(`Saved message from ${userId}: ${text}`);

    // TODO: Emit Socket.io event to frontend (Step 17)
}
