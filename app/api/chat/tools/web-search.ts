import { tool } from 'ai';
import { z } from 'zod';
import Exa from 'exa-js';

const exa = process.env.EXA_API_KEY ? new Exa(process.env.EXA_API_KEY) : null;

export const webSearch = tool({
  description: 'Search the web for up-to-date information',
  inputSchema: z.object({
    query: z.string().min(1).describe('The search query'),
  }),
  execute: async ({ query }) => {
    try {
      if (!exa) {
        console.error('EXA_API_KEY is not set');
        return [];
      }
      const { results } = await exa.search(query, {
        contents: {
          text: true,
        },
        numResults: 3,
      });

      return results.map(result => ({
        title: result.title,
        url: result.url,
        content: result.text?.slice(0, 1000) || '',
        publishedDate: result.publishedDate,
      }));
    } catch (error) {
      console.error('Error searching the web:', error);
      return [];
    }
  },
});