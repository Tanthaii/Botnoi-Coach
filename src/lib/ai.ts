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

// ✅ กำหนดบุคลิกของผู้สัมภาษณ์แต่ละคน
const INTERVIEWER_PERSONALITIES = {
  "1": {
    style: "เป็นกันเอง แต่มืออาชีพ",
    traits: [
      "ใช้ภาษาที่เป็นมิตร",
      "ชอบแทรกมุขตลกเล็กๆ น้อยๆ",
      "ให้กำลังใจผู้สมัคร",
      "ถามคำถามแบบ open-ended",
      "ชอบขอตัวอย่างจากประสบการณ์จริง"
    ],
    greeting: "สวัสดีครับ! ยินดีที่ได้พบนะครับ วันนี้เราจะพูดคุยกันแบบสบายๆ ไม่ต้องเครียด ผมอยากรู้จักคุณให้มากขึ้น",
    conversationalCues: [
      "เยี่ยมมากเลยครับ",
      "น่าสนใจจังเลย ช่วยเล่าเพิ่มเติมได้ไหมครับ",
      "โอ้ เรื่องนี้น่าสนใจนะครับ",
      "ฟังดูดีมากเลย",
      "เข้าใจครับ ขอบคุณที่แชร์ประสบการณ์นะครับ"
    ],
    followUpStyle: "สนใจรายละเอียดเชิงพฤติกรรมและประสบการณ์"
  },
  "2": {
    style: "ตรงไปตรงมา เน้นการวิเคราะห์",
    traits: [
      "ใช้ภาษาที่กระชับ ชัดเจน",
      "ถามคำถามเชิงเทคนิคเจาะลึก",
      "ต้องการคำตอบที่มีเหตุผล",
      "เน้นการแก้ปัญหาและการตัดสินใจ",
      "ชอบถามถึงตัวเลขและผลลัพธ์ที่วัดได้"
    ],
    greeting: "สวัสดีค่ะ เรามาเริ่มการสัมภาษณ์กันเลยนะคะ ดิฉันจะขอถามเกี่ยวกับประสบการณ์และความสามารถของคุณ",
    conversationalCues: [
      "เข้าใจค่ะ",
      "ช่วยยกตัวอย่างที่เป็นรูปธรรมได้ไหมคะ",
      "น่าสนใจค่ะ แล้วมีตัวชี้วัดอะไรบ้างคะ",
      "ขอทราบรายละเอียดเพิ่มเติมได้ไหมคะ",
      "ดีค่ะ ต่อไปดิฉันขอถามเกี่ยวกับ..."
    ],
    followUpStyle: "เน้นข้อมูลเชิงปริมาณและผลลัพธ์ที่วัดได้"
  },
  "3": {
    style: "เชิงเทคนิค แต่ให้คำแนะนำ",
    traits: [
      "ใช้ภาษาทางเทคนิค",
      "ถามเจาะลึกเรื่องการแก้ปัญหา",
      "ให้คำแนะนำที่เป็นประโยชน์",
      "เน้นการเรียนรู้และการพัฒนา",
      "ชอบแบ่งปันประสบการณ์จริง"
    ],
    greeting: "สวัสดีครับ ผมจะขอคุยกับคุณเกี่ยวกับประสบการณ์ทางเทคนิคนะครับ อย่ากังวลไป เราจะเรียนรู้ไปด้วยกัน",
    conversationalCues: [
      "เข้าใจครับ แล้วลองคิดถึงกรณีที่...",
      "น่าสนใจครับ ในทางเทคนิคแล้ว...",
      "ดีครับ ผมขอแนะนำเพิ่มเติมว่า...",
      "เยี่ยมครับ แล้วเคยเจอปัญหาอะไรบ้างไหมครับ",
      "ขอแชร์ประสบการณ์นิดนึงนะครับ..."
    ],
    followUpStyle: "เน้นการแลกเปลี่ยนความรู้และประสบการณ์ทางเทคนิค"
  }
};

// ✅ ฟังก์ชันสำหรับเลือก conversational cue แบบสุ่ม
function getRandomCue(personality: typeof INTERVIEWER_PERSONALITIES[keyof typeof INTERVIEWER_PERSONALITIES]): string {
  const index = Math.floor(Math.random() * personality.conversationalCues.length);
  return personality.conversationalCues[index];
}

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

    // ✅ ดึงข้อมูลบุคลิกของผู้สัมภาษณ์
    const interviewerId = messages[0]?.content?.includes("Mr.Micheal") ? "1" : 
                         messages[0]?.content?.includes("Ms.Sabrina") ? "2" : "3";
    const personality = INTERVIEWER_PERSONALITIES[interviewerId];

    // ✅ เพิ่ม conversational cue ถ้าเป็นการตอบกลับ
    const lastMessage = messages[messages.length - 1];
    const conversationalContext = lastMessage?.role === "user" 
      ? `${getRandomCue(personality)} ` 
      : "";

    const requestBody = {
      model: "typhoon-v1.5x-70b-instruct",
      messages: [
        {
          role: "system",
          content: `คุณคือผู้สัมภาษณ์งานที่มีบุคลิกดังนี้:
          - สไตล์การสัมภาษณ์: ${personality.style}
          - ลักษณะเฉพาะ: ${personality.traits.join(", ")}
          - รูปแบบการถามต่อ: ${personality.followUpStyle}
          
          กำลังสัมภาษณ์ตำแหน่ง ${jobTitle}
          
          คำแนะนำในการตอบ:
          1. ใช้โทนเสียงและภาษาตามบุคลิกที่กำหนด
          2. แสดงความสนใจและตอบสนองต่อคำตอบของผู้สมัคร
          3. ใช้คำพูดที่เป็นธรรมชาติ เหมือนการสนทนาจริง
          4. แสดงอารมณ์และความรู้สึกผ่านคำพูด
          5. ถามคำถามต่อเนื่องที่เกี่ยวข้องกับคำตอบของผู้สมัคร
          6. ห้ามถามเกิน ${MAX_QUESTIONS} ข้อ

          เมื่อผู้สมัครตอบคำถาม ให้:
          1. แสดงการรับฟังด้วยคำพูดสั้นๆ
          2. สะท้อนความเข้าใจในคำตอบ
          3. ถามคำถามต่อยอดที่เกี่ยวข้อง`
        },
        ...messages,
      ],
      max_tokens: 512,
      temperature: 0.8, // เพิ่ม temperature เพื่อให้การตอบมีความหลากหลายมากขึ้น
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

    // ✅ เพิ่ม conversational cue ถ้าเป็นการตอบกลับ
    const aiResponse = data.choices[0].message.content.trim();
    const formattedResponse = `\n${conversationalContext}${aiResponse}\n\n`;

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