import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey || 'MISSING_API_KEY');

export async function analyzeErrorCode(code: string, brand: string): Promise<string> {
  if (!apiKey) {
    throw new Error('API Key no configurada. Por favor, añade VITE_GEMINI_API_KEY en Vercel.');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

  const prompt = `
Eres un técnico experto en refrigeración, aire acondicionado y climatización (HVAC).
Me están reportando un código de error en un equipo.

Código de Error: ${code}
Marca del Equipo: ${brand || 'No especificada'}

Por favor, actúa como un experto y dime:
1. ¿Qué significa probablemente este código de error en esta marca?
2. ¿Cuáles son las posibles causas?
3. Da una lista de pasos técnicos recomendados para solucionar el problema.

Responde de forma profesional, clara y estructurada en formato Markdown. 
Usa títulos, viñetas y texto en negrita donde sea apropiado. Sé directo, sin rodeos, y enfocado en la solución. No uses etiquetas HTML, solo Markdown puro. Si no sabes con exactitud el error para esta marca en específico, indica cuáles son los problemas más comunes que causan códigos similares en la industria.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error in analyzeErrorCode:', error);
    throw new Error('Error IA: ' + (error instanceof Error ? error.message : String(error)));
  }
}
