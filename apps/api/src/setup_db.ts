import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../.env') });

const createDbIfNeeded = async () => {
    const adminClient = new Client({
        user: 'postgres',
        password: 'postgres', // Default, should be from env strictly speaking but using default for setup
        host: 'localhost',
        port: 5432,
        database: 'postgres'
    });

    try {
        await adminClient.connect();
        const res = await adminClient.query("SELECT 1 FROM pg_database WHERE datname = 'linechat'");
        if (res.rowCount === 0) {
            console.log('Creating database linechat...');
            await adminClient.query('CREATE DATABASE linechat');
        } else {
            console.log('Database linechat already exists.');
        }
    } catch (err) {
        console.error('Error creating database:', err);
    } finally {
        await adminClient.end();
    }
};

const runSchema = async () => {
    const isLocal = process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1');

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: isLocal ? false : { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const schemaPath = path.join(__dirname, '../../../database/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Running schema migration...');
        await client.query(schemaSql);
        console.log('Schema migration completed successfully.');
    } catch (err) {
        console.error('Error running schema:', err);
    } finally {
        await client.end();
    }
};

const main = async () => {
    // await createDbIfNeeded(); // Skip for Supabase
    await runSchema();
};

main();
