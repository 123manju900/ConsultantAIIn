import { Pinecone } from '@pinecone-database/pinecone';
import { PINECONE_TOP_K } from '@/config';
import { searchResultsToChunks, getSourcesFromChunks, getContextFromSources } from '@/lib/sources';
import { PINECONE_INDEX_NAME } from '@/config';

export const pinecone = process.env.PINECONE_API_KEY
    ? new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
    })
    : null;

export const pineconeIndex = pinecone ? pinecone.Index(PINECONE_INDEX_NAME) : null;

export async function searchPinecone(
    query: string,
): Promise<string> {
    if (!pineconeIndex) {
        return "Pinecone API key not set";
    }

    const results = await pineconeIndex.namespace('default').searchRecords({
        query: {
            inputs: {
                text: query,
            },
            topK: PINECONE_TOP_K,
        },
        fields: ['text', 'pre_context', 'post_context', 'source_url', 'source_description', 'source_type', 'order'],
    });

    const chunks = searchResultsToChunks(results);
    const sources = getSourcesFromChunks(chunks);
    const context = getContextFromSources(sources);
    return `< results > ${context} </results>`;
}