import { createClient } from '@vercel/kv';

export const kv = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? createClient({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
    })
    : null;
