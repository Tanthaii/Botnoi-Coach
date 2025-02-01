import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with environment variable
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const TYPHOON_API_KEY = import.meta.env.VITE_TYPHOON_API_KEY;
const TYPHOON_API_URL = 'https://api.typhoon-ai.com/v1/chat/completions';

// Initialize Gemini AI only if API key is available
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

interface TyphoonMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface TyphoonResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const API_ERROR_MESSAGES = {
  TYPHOON_KEY_MISSING: 'ระบบสัมภาษณ์ยังไม่พร้อมใช้งาน กรุณาติดต่อผู้ดูแลระบบ',
  GEMINI_KEY_MISSING: 'ระบบประเมินยังไม่พร้อมใช้งาน กรุณาติดต่อผู้ดูแลระบบ',
  INVALID_RESPONSE: 'ขออภัยครับ ระบบ AI ตอบกลับในรูปแบบที่ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง',
  CONNECTION_ERROR: 'ขออภัยครับ ไม่สามารถเชื่อมต่อกับระบบ AI ได้ในขณะนี้ กรุณาลองใหม่ในภายหลัง',
  GENERAL_ERROR: 'ขออภัยครับ มีปัญหาในการเชื่อมต่อกับระบบ AI กรุณาลองใหม่อีกครั้งในภายหลัง'
};

export async function generateResponse(
  messages: TyphoonMessage[],
  jobTitle: string
): Promise<string> {
  if (!TYPHOON_API_KEY) {
    console.error('Typhoon API key is missing');
    return API_ERROR_MESSAGES.TYPHOON_KEY_MISSING;
  }

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

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: TyphoonResponse = await response.json();
    
    if (!data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating response:', error);
    if (error instanceof Error) {
      if (error.message === 'Invalid response format from API') {
        return API_ERROR_MESSAGES.INVALID_RESPONSE;
      }
      if (error.message.includes('API request failed')) {
        return API_ERROR_MESSAGES.CONNECTION_ERROR;
      }
    }
    return API_ERROR_MESSAGES.GENERAL_ERROR;
  }
}

export async function evaluateResponse(
  userResponse: string,
  context: string,
  jobTitle: string
): Promise<string> {
  if (!GEMINI_API_KEY || !genAI) {
    console.error('Gemini API key is missing or initialization failed');
    return API_ERROR_MESSAGES.GEMINI_KEY_MISSING;
  }

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
    if (!result?.response) {
      throw new Error('Invalid Gemini API response');
    }
    
    const response = await result.response;
    const text = response.text();
    if (!text) {
      throw new Error('Empty response from Gemini API');
    }
    
    return text;
  } catch (error) {
    console.error('Error evaluating response:', error);
    if (error instanceof Error) {
      if (error.message === 'Invalid Gemini API response' || error.message === 'Empty response from Gemini API') {
        return 'ขออภัยครับ ระบบประเมินคำตอบไม่สามารถทำงานได้ในขณะนี้';
      }
    }
    return 'ขออภัยครับ มีปัญหาในการประเมินคำตอบ';
  }
}