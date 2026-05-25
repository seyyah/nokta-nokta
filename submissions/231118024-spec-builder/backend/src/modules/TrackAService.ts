import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'dummy_key'
});

export interface SpecOutput {
  Problem: string;
  TargetAudience: string;
  Scope: string;
}

export class TrackAService {
  public static async generateSpec(cleanIdea: string): Promise<SpecOutput> {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a Senior Product Manager. Your job is to take a raw idea and convert it into a structured Product Specification. 
You MUST return ONLY a valid JSON object matching this schema exactly, using PascalCase for the keys:
{
  "Problem": "A concise description of the real pain point",
  "TargetAudience": "Who exactly will use this",
  "Scope": "The MVP boundaries"
}`
          },
          {
            role: 'user',
            content: `Raw idea: ${cleanIdea}`
          }
        ],
        model: 'llama3-8b-8192',
        response_format: { type: 'json_object' }
      });

      const jsonStr = completion.choices[0]?.message?.content;
      if (!jsonStr) {
        throw new Error('No content returned from Groq');
      }

      const parsed = JSON.parse(jsonStr) as SpecOutput;
      return parsed;

    } catch (error) {
      console.error('Error generating spec:', error);
      // Fallback in case of API failure or missing keys
      return {
        Problem: "API error or missing key. Cannot determine problem.",
        TargetAudience: "N/A",
        Scope: "N/A"
      };
    }
  }
}
