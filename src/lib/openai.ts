import OpenAI from 'openai';
import { SUMMARY_SYSTEM_PROMPT } from '@/utils/prompts';
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateSummaryFromOpenAI(pdfText: string) {
  try {
    const response = await client.responses.create({
      model: 'gpt-4.1',
      input: [
        {
          role: 'system',
          content: SUMMARY_SYSTEM_PROMPT
        },
        {
          role: 'developer',
          content:
            'You are a social media content expert who makes complex documents easy and engaging to read.'
        },
        {
          role: 'user',
          content: `Transform this document into an engaging, easy-to-read summary with contextually relevant emojis and proper markdown formatting:\n\n${pdfText}`
        }
      ],
      temperature: 0.7,
      store: false,
      max_output_tokens: 1000
    });
    return response.output_text;
  } catch (error: any) {
    if (error instanceof OpenAI.APIError && error.status === 429) {
      console.error('Rate limit exceeded. Please try again later.');
    } else {
      console.error('Error generating summary from OpenAI:', error);
    }
    return null;
  }
}

//console.log(response.output_text);
