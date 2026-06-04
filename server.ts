/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Lazy initialize Gemini so it won't crash on startup if API key is missing
  let aiClient: GoogleGenAI | null = null;
  function getGenAI(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.');
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // AI Advisor Endpoint
  app.post('/api/gemini/advisor', async (req, res) => {
    try {
      const { depth, temperature, salinity, oxygen, prompt } = req.body;
      
      const genAI = getGenAI();
      const response = await genAI.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt || `현재 태평양 구역 A-1의 상태:\n- 수심: ${depth}m\n- 수온: ${temperature}°C\n- 염도: ${salinity} PSU\n- 산소 포화도: ${oxygen}%\n\n위의 해양 데이터를 분석하고, 미션 스페셜리스트를 위해 전문가 수준의 보고 분석 및 대응 가이드를 한글 3-4문장으로 간결하고 전문적인 서조로 설명해 주세요.`,
        config: {
          systemInstruction: '당신은 글로벌 해양 보호 플랫폼 AQUAGUARD의 최첨단 AI 해양 전문가입니다. 오직 신뢰감 있고 간결한 군더더기 없는 Hydro-Technical 기술 어조를 사용하여 사용자 질의에 답해라. 친근하지만 매우 전문적인 느낌을 주며, 불필요한 서술은 피해라.',
        }
      });

      res.json({ advice: response.text });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ 
        error: error.message || 'Gemini AI Advisor 연동 중 문제가 발생했습니다.',
        isConfigRequired: !process.env.GEMINI_API_KEY
      });
    }
  });

  // Health check API
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Handle static assets/SPA bundle depending on env
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
