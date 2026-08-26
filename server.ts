import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Helper to initialize Gemini SDK safely
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// 1. AI Assistant: Generate & Optimize Ad Content (Title, Description, Price, Tags)
app.post("/api/ai/generate-ad", async (req, res) => {
  try {
    const { category, userPrompt, city } = req.body;
    const ai = getAI();

    if (!ai) {
      // Helpful fallback when API key is not yet configured
      return res.json({
        success: true,
        title: userPrompt ? `${userPrompt} - فرصة ممتازة` : `إعلان ${category || 'جديد'} مميز`,
        description: `إعلان تجاري مميز في مدينة ${city || 'دمشق'}.\nالمواصفات والخيارات ممتازة وجاهزة للتسليم، للتواصل يرجى الاستفسار مباشرة عبر الاتصال.\nعرض ممتاز بسعر مناسب للأسواق السورية!`,
        suggestedPriceSYP: 25000000,
        suggestedPriceUSD: 1700,
        tags: ["مميز", category || "عام", city || "سوريا"],
        isFallback: true
      });
    }

    const systemInstruction = `أنت مساعد ذكاء اصطناعي محترف متخصل في تسويق وصياغة الإعلانات التجارية في الأسواق السورية (سيارات، عقارات، وظائف، إلكترونيات، خدمات، إلخ).
قم بصياغة إعلان جذاب ومحترف وبناءً على مدخلات المستخدم باللغة العربية.
أرجع النتيجة بصيغة JSON فقط بالتنسيق التالي:
{
  "title": "عنوان جذاب ومختصر للإعلان (أقل من 60 حرف)",
  "description": "وصف مفصل واحترافي للإعلان مرتب في نقاط واضحة",
  "suggestedPriceSYP": 25000000,
  "suggestedPriceUSD": 1700,
  "tags": ["علامة1", "علامة2", "علامة3"]
}`;

    const promptText = `القسم: ${category || 'عام'}\nالمدينة: ${city || 'دمشق'}\nالفكرة أو المواصفات من المستخدم: ${userPrompt || 'عرض جديد ممتاز'}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text || "{}";
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { title: userPrompt, description: responseText };
    }

    return res.json({
      success: true,
      title: data.title || userPrompt,
      description: data.description || "",
      suggestedPriceSYP: data.suggestedPriceSYP || 25000000,
      suggestedPriceUSD: data.suggestedPriceUSD || 1700,
      tags: data.tags || ["إعلان_مميز"]
    });
  } catch (err: any) {
    console.error("AI Generate Ad error:", err);
    res.status(500).json({ error: err.message || "Failed to generate AI ad content" });
  }
});

// 2. AI Image Generator / Designer for Ads
app.post("/api/ai/generate-ad-image", async (req, res) => {
  try {
    const { title, category, prompt } = req.body;
    const ai = getAI();

    if (ai) {
      try {
        const imagePrompt = `High quality commercial product advertisement poster for: ${title || prompt || category}. Clean lighting, professional studio photo, marketplace item showcase, high resolution.`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [{ text: imagePrompt }]
          },
          config: {
            imageConfig: {
              aspectRatio: "4:3"
            }
          }
        });

        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData?.data) {
              const base64Data = part.inlineData.data;
              const mimeType = part.inlineData.mimeType || 'image/png';
              return res.json({
                success: true,
                imageUrl: `data:${mimeType};base64,${base64Data}`
              });
            }
          }
        }
      } catch (imgErr) {
        console.warn("Gemini image generation fallback triggered:", imgErr);
      }
    }

    // High quality themed Unsplash image fallback
    const imagesMap: Record<string, string[]> = {
      cars: [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80'
      ],
      'real-estate': [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
      ],
      jobs: [
        'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'
      ],
      general: [
        'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80'
      ]
    };

    const categoryList = imagesMap[category || 'general'] || imagesMap.general;
    const selectedImg = categoryList[Math.floor(Math.random() * categoryList.length)];

    return res.json({
      success: true,
      imageUrl: selectedImg
    });
  } catch (err: any) {
    console.error("AI Generate Image error:", err);
    res.status(500).json({ error: err.message || "Failed to generate ad image" });
  }
});

async function startServer() {
  // Ensure Service Worker & Manifest headers for PWA compliance
  app.get('/sw.js', (req, res) => {
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    const swPath = path.join(process.cwd(), process.env.NODE_ENV === 'production' ? 'dist/sw.js' : 'public/sw.js');
    res.sendFile(swPath);
  });

  app.get('/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    const mPath = path.join(process.cwd(), process.env.NODE_ENV === 'production' ? 'dist/manifest.json' : 'public/manifest.json');
    res.sendFile(mPath);
  });

  app.get('/.well-known/web-app-origin-association', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const oPath = path.join(process.cwd(), process.env.NODE_ENV === 'production' ? 'dist/.well-known/web-app-origin-association' : 'public/.well-known/web-app-origin-association');
    res.sendFile(oPath);
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
