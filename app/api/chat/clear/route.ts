import { kv } from '@/lib/kv';

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get('chatId');

    if (chatId && kv) {
        try {
            await kv.del(`chat:${chatId}`);
            console.log(`Cleared chat: ${chatId}`);
        } catch (error) {
            console.error('KV delete failed:', error);
        }
    }

    return Response.json({ success: true });
}
