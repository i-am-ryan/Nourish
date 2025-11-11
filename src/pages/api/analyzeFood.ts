// src/pages/api/analyzeFood.ts
import { NextApiRequest, NextApiResponse } from 'next';

// 🛑 IMPORTANT: The API key is securely accessed via the Vercel environment variable!
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash"; 

// Configuration to handle large image payloads and extend the execution time
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb', // Increase limit for image data
    },
    maxDuration: 10, // Max duration for Vercel Hobby/Pro (default is 5s)
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Check for the API Key
  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY not set!");
    // Status 500 for a server-side misconfiguration
    return res.status(500).json({ 
        error: 'Server configuration error: GEMINI_API_KEY missing on Vercel.' 
    });
  }

  try {
    const { image, prompt } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Missing image data.' });
    }

    // Extract the base64 part of the data URL (e.g., removing 'data:image/jpeg;base64,')
    const base64Data = image.split(",")[1];

    const fullPrompt = prompt || `Analyze the food item in this image. Provide detailed information in a valid JSON object. Include:
1.  **foodName**: A short name for the food.
2.  **description**: A brief one-sentence description.
3.  **nutritionalInfo**: An object with calories (per 100g), protein, carbs, fats, fiber, and key vitamins (as an array of strings).
4.  **ingredients**: An array of main ingredients, if visible or obvious.
5.  **availability**: An object containing 'stores' (an array of major South African retailers like Pick n Pay, Checkers, Woolworths, Shoprite, Spar), 'priceRange' (a string estimate in ZAR), and 'commonBrands' (as an array of strings).
6.  **storageAdvice**: A string with storage tips.
7.  **shelfLife**: A string describing the typical shelf life.

Respond ONLY with the raw JSON object, without any markdown formatting like \`\`\`json or \`\`\`.`;

    // 2. Call the secure Gemini API endpoint
    const apiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: fullPrompt }] },
            {
              inline_data: {
                mime_type: "image/jpeg", 
                data: base64Data,
              },
            },
          ],
        }),
      }
    );

    // 3. Handle potential Gemini API errors (e.g., rate limit, bad request)
    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error("External API Error:", errorData);
      return res.status(apiResponse.status).json({
        error: errorData.error?.message || `External API request failed with status ${apiResponse.status}`,
      });
    }

    // 4. Return the successful response from Gemini
    const data = await apiResponse.json();
    return res.status(200).json(data);

  } catch (e: any) {
    console.error("Internal Server Error:", e);
    return res.status(500).json({ error: 'An unexpected server error occurred.' });
  }
}