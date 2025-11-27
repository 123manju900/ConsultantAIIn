
import { streamText, UIMessage, convertToModelMessages, stepCountIs, createUIMessageStream, createUIMessageStreamResponse } from 'ai';
import { MODEL } from '@/config';
import { SYSTEM_PROMPT } from '@/prompts';
import { isContentFlagged } from '@/lib/moderation';
import { webSearch } from './tools/web-search';
import { vectorDatabaseSearch } from './tools/search-vector-database';
import { kv } from '@/lib/kv';

export const maxDuration = 30;
export async function POST(req: Request) {
    const { messages, chatId }: { messages: UIMessage[], chatId?: string } = await req.json();

    if (chatId && kv) {
        try {
            const lastMessage = messages[messages.length - 1];
            await kv.lpush(`chat:${chatId}`, JSON.stringify(lastMessage));
            await kv.expire(`chat:${chatId}`, 300); // 5 min expiry
        } catch (error) {
            console.error('KV save failed:', error);
        }
    }

    const latestUserMessage = messages
        .filter(msg => msg.role === 'user')
        .pop();

    if (latestUserMessage) {
        const textParts = latestUserMessage.parts
            .filter(part => part.type === 'text')
            .map(part => 'text' in part ? part.text : '')
            .join('');

        if (textParts) {
            const moderationResult = await isContentFlagged(textParts);

            if (moderationResult.flagged) {
                const stream = createUIMessageStream({
                    execute({ writer }) {
                        const textId = 'moderation-denial-text';

                        writer.write({
                            type: 'start',
                        });

                        writer.write({
                            type: 'text-start',
                            id: textId,
                        });

                        writer.write({
                            type: 'text-delta',
                            id: textId,
                            delta: moderationResult.denialMessage || "Your message violates our guidelines. I can't answer that.",
                        });

                        writer.write({
                            type: 'text-end',
                            id: textId,
                        });

                        writer.write({
                            type: 'finish',
                        });
                    },
                });

                return createUIMessageStreamResponse({ stream });
            }
        }
    }

    const result = streamText({
        model: MODEL,
        system: SYSTEM_PROMPT,
        messages: convertToModelMessages(messages),
        tools: {
            webSearch,
            vectorDatabaseSearch,
        },
        stopWhen: stepCountIs(10),
        providerOptions: {
            openai: {
                reasoningSummary: 'auto',
                reasoningEffort: 'low',
                parallelToolCalls: false,
            }
        },
        onFinish: async ({ text, toolCalls }) => {
            if (chatId && kv) {
                try {
                    await kv.lpush(`chat:${chatId}`, JSON.stringify({
                        role: 'assistant',
                        content: text,
                        toolInvocations: toolCalls,
                    }));
                    await kv.expire(`chat:${chatId}`, 300); // Refresh expiry
                } catch (error) {
                    console.error('KV save failed:', error);
                }
            }
        }
    });

    return result.toUIMessageStreamResponse({
        sendReasoning: true,
    });
}
