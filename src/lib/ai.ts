import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyCZ4GECnSPbxDIpNayZXVPE5R8XrOMDeZY');

// Initialize Typhoon API configuration
const TYPHOON_API_KEY = 'sk-l6MuTyQgRWW4TNamkLzhgDAoMZ6PZRPlw5NckabZGChU9L4T';
const TYPHOON_API_URL = 'https://api.typhoon-ai.com/v1/chat/completions';

interface TyphoonMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function generateResponse(
  messages: TyphoonMessage[],
  jobTitle: string
): Promise<string> {
  try {
    const response = await fetch(TYPHOON_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TYPHOON_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `You are a professional HR interviewer conducting an interview for a ${jobTitle} position. 
            Respond in Thai language. Be professional but friendly. Ask relevant follow-up questions based on the candidate's responses.
            Focus on technical skills, experience, and cultural fit.`
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating response:', error);
    return 'ขออภัยครับ มีปัญหาในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง';
  }
}

export async function evaluateResponse(
  userResponse: string,
  context: string,
  jobTitle: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
    As an HR expert, evaluate this job candidate's response for a ${jobTitle} position.
    
    Context: ${context}
    Candidate's Response: ${userResponse}
    
    Analyze the response for:
    1. Relevance to the question
    2. Technical knowledge
    3. Communication clarity
    4. Professional attitude
    
    Provide a brief evaluation in Thai language that can help generate a good follow-up question.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error evaluating response:', error);
    return '';
  }
}