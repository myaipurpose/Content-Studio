import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for chat completions
  app.post("/api/chat", async (req, res) => {
    try {
      const { provider, apiKey, model, prompt } = req.body;

      if (!provider || !apiKey || !model || !prompt) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      let apiUrl = "";
      let headers: any = {
        "Content-Type": "application/json",
      };
      let body: any = {};

      if (provider === "openrouter") {
        apiUrl = "https://openrouter.ai/api/v1/chat/completions";
        headers["Authorization"] = `Bearer ${apiKey}`;
        headers["HTTP-Referer"] = "http://localhost:3000";
        headers["X-Title"] = "Content Studio";
        body = {
          model,
          messages: [{ role: "user", content: prompt }],
        };
      } else if (provider === "groq") {
        apiUrl = "https://api.groq.com/openai/v1/chat/completions";
        headers["Authorization"] = `Bearer ${apiKey}`;
        body = {
          model,
          messages: [{ role: "user", content: prompt }],
        };
      } else if (provider === "nvidia") {
        apiUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
        headers["Authorization"] = `Bearer ${apiKey}`;
        body = {
          model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1024,
        };
      } else if (provider === "gemini") {
        apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        body = {
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        };
      } else {
        return res.status(400).json({ error: "Unsupported provider" });
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Failed to generate content from ${provider}`);
      }

      const data = await response.json();
      
      let content = "";
      if (provider === "gemini") {
        content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      } else {
        content = data.choices[0].message.content;
      }

      res.json({ content });
    } catch (error: any) {
      console.error("Chat API Error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // API route to fetch available models
  app.post("/api/models", async (req, res) => {
    try {
      const { provider, apiKey } = req.body;

      if (!provider) {
        return res.status(400).json({ error: "Missing provider field" });
      }

      let models: { id: string, name: string }[] = [];

      if (provider === "openrouter") {
        const response = await fetch("https://openrouter.ai/api/v1/models");
        if (response.ok) {
          const data = await response.json();
          models = data.data.map((m: any) => ({ id: m.id, name: m.name || m.id }));
        }
      } else if (provider === "groq") {
        const response = await fetch("https://api.groq.com/openai/v1/models", {
          headers: apiKey ? { "Authorization": `Bearer ${apiKey}` } : {}
        });
        if (response.ok) {
          const data = await response.json();
          models = data.data.map((m: any) => ({ id: m.id, name: m.id }));
        }
      } else if (provider === "nvidia") {
        const response = await fetch("https://integrate.api.nvidia.com/v1/models");
        if (response.ok) {
          const data = await response.json();
          models = data.data.map((m: any) => ({ id: m.id, name: m.id }));
        }
      } else if (provider === "gemini") {
        if (!apiKey) {
           models = [
             { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
             { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
             { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
             { id: "gemini-2.0-pro-exp", name: "Gemini 2.0 Pro Experimental" },
             { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" },
             { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" }
           ];
        } else {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
          if (response.ok) {
            const data = await response.json();
            models = data.models
              .filter((m: any) => m.supportedGenerationMethods.includes("generateContent"))
              .map((m: any) => ({ id: m.name.replace('models/', ''), name: m.displayName || m.name }));
          } else {
             models = [
               { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
               { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" }
             ];
          }
        }
      }

      res.json({ models });
    } catch (error: any) {
      console.error("Models API Error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  app.post("/api/scrape", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "Missing url field" });
      }

      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        try {
          const { YoutubeTranscript } = await import("youtube-transcript");
          const transcript = await YoutubeTranscript.fetchTranscript(url);
          const text = transcript.map((t) => t.text).join(" ");
          return res.json({ title: "YouTube Video", content: text });
        } catch (error: any) {
          console.error("YouTube Scrape Error:", error);
          return res.status(500).json({ error: "Could not fetch YouTube transcript. The video might not have captions." });
        }
      } else {
        const fetchResponse = await fetch(`https://r.jina.ai/${url}`, {
          headers: {
            "Accept": "text/plain",
          }
        });
        
        if (!fetchResponse.ok) {
          throw new Error(`Failed to fetch URL: ${fetchResponse.statusText}`);
        }
        
        const markdown = await fetchResponse.text();
        return res.json({ title: url, content: markdown.substring(0, 15000) });
      }
    } catch (error: any) {
      console.error("Scrape Error:", error);
      res.status(500).json({ error: error.message || "Failed to scrape URL" });
    }
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
