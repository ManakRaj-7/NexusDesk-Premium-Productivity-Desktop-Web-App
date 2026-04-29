import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  try {
    console.log("Using API Key starting with:", process.env.GEMINI_API_KEY.substring(0, 10));
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("Hi");
    const response = await result.response;
    console.log("Success! Response:", response.text());
  } catch (err) {
    console.error("Diagnostic Failed!");
    console.error("Status:", err.status);
    console.error("Message:", err.message);
    if (err.response) {
       console.error("Response Details:", err.response);
    }
  }
}

run();
