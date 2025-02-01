import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize API keys with validation
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const TYPHOON_API_KEY = import.meta.env.VITE_TYPHOON_API_KEY;
const TYPHOON_API_URL = 'https://api.typhoon-ai.com/v1/chat/completions';

if (!TYPHOON_API_KEY) {
  console.error('❌ Missing VITE_TYPHOON_API_KEY environment variable');
}

if (!GEMINI_API_KEY) {
  console.error('❌ Missing VITE_GEMINI_API_KEY environment variable');
}

// Initialize Gemini AI only if API key is available
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

interface TyphoonMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface TyphoonResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const API_ERROR_MESSAGES = {
  TYPHOON_KEY_MISSING: '🚨 ระบบสัมภาษณ์ยังไม่พร้อมใช้งาน กรุณาติดต่อผู้ดูแลระบบ',
  GEMINI_KEY_MISSING: '🚨 ระบบประเมินยังไม่พร้อมใช้งาน กรุณาติดต่อผู้ดูแลระบบ',
  INVALID_RESPONSE: '⚠️ ข้อมูลที่ได้จาก AI มีปัญหา กรุณาลองใหม่อีกครั้ง',
  CONNECTION_ERROR: '⚠️ ไม่สามารถเชื่อมต่อกับ AI ได้ในขณะนี้ กรุณาลองใหม่ในภายหลัง',
  GENERAL_ERROR: '⚠️ มีปัญหาในการเชื่อมต่อ กรุณาลองใหม่ในภายหลัง'
};

export async function generateResponse(
  messages: TyphoonMessage[],
  jobTitle: string
): Promise<string> {
  if (!TYPHOON_API_KEY) {
    console.error('❌ Typhoon API key is missing');
    return API_ERROR_MESSAGES.TYPHOON_KEY_MISSING;
  }

  try {
    console.log('📡 Sending request to Typhoon API:', messages);

    const requestBody = {
      model: "gpt-3.5-turbo",
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
    };

    console.log('📝 Request body:', requestBody);

    const response = await fetch(TYPHOON_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TYPHOON_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log('📩 Raw API response:', responseText);

    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText, responseText);
      return API_ERROR_MESSAGES.CONNECTION_ERROR;
    }

    let data: TyphoonResponse;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ JSON Parsing Error:', e, responseText);
      return API_ERROR_MESSAGES.INVALID_RESPONSE;
    }
    
    if (!data?.choices?.[0]?.message?.content) {
      console.error('⚠️ Invalid API response format:', data);
      return API_ERROR_MESSAGES.INVALID_RESPONSE;
    }

    console.log('✅ Received response from Typhoon API:', data.choices[0].message.content);
    return data.choices[0].message.content;
  } catch (error) {
    console.error('❌ Error generating response:', error);
    return API_ERROR_MESSAGES.GENERAL_ERROR;
  }
}

export async function evaluateResponse(
  userResponse: string,
  context: string,
  jobTitle: string
): Promise<string> {
  if (!GEMINI_API_KEY || !genAI) {
    console.error('❌ Gemini API key is missing or initialization failed');
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

    console.log('📡 Sending request to Gemini API');

    const result = await model.generateContent(prompt);
    if (!result?.response) {
      console.error('⚠️ Invalid Gemini API response');
      return API_ERROR_MESSAGES.INVALID_RESPONSE;
    }

    const response = await result.response;
    const text = response.text();
    if (!text) {
      console.error('⚠️ Empty response from Gemini API');
      return API_ERROR_MESSAGES.INVALID_RESPONSE;
    }

    console.log('✅ Received response from Gemini API:', text);
    return text;
  } catch (error) {
    console.error('❌ Error evaluating response:', error);
    return API_ERROR_MESSAGES.GENERAL_ERROR;
  }
}
