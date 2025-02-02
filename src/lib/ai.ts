import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ ใช้ API Key จาก Environment Variables
const GEMINI_API_KEY = 'AIzaSyCZ4GECnSPbxDIpNayZXVPE5R8XrOMDeZY';
const TYPHOON_API_KEY = 'sk-l6MuTyQgRWW4TNamkLzhgDAoMZ6PZRPlw5NckabZGChU9L4T';
const TYPHOON_API_URL = 'https://api.opentyphoon.ai/v1/chat/completions';


// ตรวจสอบ API Key ก่อนใช้งาน
if (!TYPHOON_API_KEY) {
  console.error("❌ Missing OpenTyphoon API Key");
}
if (!GEMINI_API_KEY) {
  console.error("❌ Missing Gemini API Key");
}

// ✅ Initialize Gemini AI
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

interface TyphoonMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface TyphoonResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

// ข้อความ Error ที่ใช้ในระบบ
const API_ERROR_MESSAGES = {
  TYPHOON_KEY_MISSING: "🚨 ระบบสัมภาษณ์ยังไม่พร้อมใช้งาน กรุณาติดต่อผู้ดูแลระบบ",
  GEMINI_KEY_MISSING: "🚨 ระบบประเมินยังไม่พร้อมใช้งาน กรุณาติดต่อผู้ดูแลระบบ",
  INVALID_RESPONSE: "⚠️ ข้อมูลที่ได้จาก AI มีปัญหา กรุณาลองใหม่อีกครั้ง",
  CONNECTION_ERROR: "⚠️ ไม่สามารถเชื่อมต่อกับ AI ได้ในขณะนี้ กรุณาลองใหม่ในภายหลัง",
  GENERAL_ERROR: "⚠️ มีปัญหาในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง",
};

// ✅ กำหนดจำนวนคำถามสูงสุดในรอบสัมภาษณ์ (10 ข้อ)
const MAX_QUESTIONS = 10;

/**
 * ✅ ใช้ OpenTyphoon API เพื่อสร้างคำตอบจาก AI (ถามเป็นข้อๆ และจำกัดที่ 10 ข้อ)
 */
export async function generateResponse(
  messages: TyphoonMessage[],
  jobTitle: string
): Promise<string> {
  if (!TYPHOON_API_KEY) {
    console.error("❌ OpenTyphoon API Key is missing");
    return API_ERROR_MESSAGES.TYPHOON_KEY_MISSING;
  }

  // ✅ ตรวจสอบว่ามีคำถามไปแล้วกี่ข้อ
  const questionCount = messages.filter((msg) => msg.role === "assistant").length;
  if (questionCount >= MAX_QUESTIONS) {
    return "🔚 **การสัมภาษณ์จบลงแล้ว**\n\nขอบคุณที่สละเวลามาพูดคุยกับเรา!";
  }

  try {
    console.log(`📡 Sending request to OpenTyphoon API for job: ${jobTitle}`);

    const requestBody = {
      model: "typhoon-v1.5x-70b-instruct",
      messages: [
        {
          role: "system",
          content: `คุณคือผู้สัมภาษณ์งานระดับมืออาชีพ กำลังสัมภาษณ์ตำแหน่ง ${jobTitle} 
          กรุณาตอบเป็นภาษาไทย ใช้โทนมืออาชีพแต่เป็นกันเอง ตั้งคำถามที่เกี่ยวข้องกับทักษะและประสบการณ์ของผู้สมัคร 
          และห้ามถามเกิน **${MAX_QUESTIONS} ข้อ**`,
        },
        ...messages,
      ],
      max_tokens: 512,
      temperature: 0.6,
      top_p: 0.95,
      repetition_penalty: 1.05,
      stream: false,
    };

    console.log("📝 Request body:", requestBody);

    const response = await fetch(TYPHOON_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TYPHOON_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log("📩 Raw API response:", responseText);

    if (!response.ok) {
      console.error("❌ API Error:", response.status, response.statusText, responseText);
      return API_ERROR_MESSAGES.CONNECTION_ERROR;
    }

    let data: TyphoonResponse;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("❌ JSON Parsing Error:", e, responseText);
      return API_ERROR_MESSAGES.INVALID_RESPONSE;
    }

    if (!data?.choices?.[0]?.message?.content) {
      console.error("⚠️ Invalid API response format:", data);
      return API_ERROR_MESSAGES.INVALID_RESPONSE;
    }

    // ✅ เพิ่มการแสดงผลเป็นข้อๆ พร้อมเว้นบรรทัด
    const formattedResponse = `\n${data.choices[0].message.content.trim()}\n\n`;

    console.log("✅ Received response from OpenTyphoon API:", formattedResponse);
    return formattedResponse;
  } catch (error) {
    console.error("❌ Error generating response:", error);
    return API_ERROR_MESSAGES.GENERAL_ERROR;
  }
}

/**
 * ✅ ใช้ Gemini AI เพื่อประเมินคำตอบของผู้สมัคร (ปรับให้ AI ประเมินตาม Job Title ที่กำหนด)
 */
export async function evaluateResponse(
  userResponse: string,
  context: string,
  jobTitle: string
): Promise<string> {
  if (!GEMINI_API_KEY || !genAI) {
    console.error("❌ Gemini API key is missing or initialization failed");
    return API_ERROR_MESSAGES.GEMINI_KEY_MISSING;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
    คุณเป็นผู้เชี่ยวชาญด้าน HR กำลังประเมินคำตอบของผู้สมัครสำหรับตำแหน่ง "${jobTitle}"

    🔹 คำถาม / บริบท: ${context}  
    🔹 คำตอบของผู้สมัคร: ${userResponse}  

    โปรดวิเคราะห์คำตอบโดยใช้เกณฑ์ต่อไปนี้:
    1️⃣ ความเกี่ยวข้องของคำตอบกับตำแหน่ง "${jobTitle}"  
    2️⃣ ความรู้ทางเทคนิคที่เกี่ยวข้องกับตำแหน่ง "${jobTitle}"  
    3️⃣ ความชัดเจนของการสื่อสาร  
    4️⃣ ทัศนคติทางอาชีพ  

    กรุณาให้ข้อเสนอแนะเป็นภาษาไทย และแนะนำคำถามติดตามผลที่เหมาะสม
    `;

    console.log(`📡 Sending request to Gemini API for job: ${jobTitle}`);

    const result = await model.generateContent(prompt);
    if (!result?.response) {
      console.error("⚠️ Invalid Gemini API response");
      return API_ERROR_MESSAGES.INVALID_RESPONSE;
    }

    const response = await result.response;
    const text = response.text();
    if (!text) {
      console.error("⚠️ Empty response from Gemini API");
      return API_ERROR_MESSAGES.INVALID_RESPONSE;
    }

    // ✅ เพิ่มการเว้นบรรทัดระหว่างคำตอบของ AI และคำถามถัดไป
    const formattedResponse = text.trim() + "\n\n";

    console.log("✅ Received evaluation from Gemini API:", formattedResponse);
    return formattedResponse;
  } catch (error) {
    console.error("❌ Error evaluating response:", error);
    return API_ERROR_MESSAGES.GENERAL_ERROR;
  }
}
