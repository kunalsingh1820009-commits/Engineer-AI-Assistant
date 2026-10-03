export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIProvider {
  readonly name: string;
  isAvailable(): boolean;
  generateChat(messages: ChatMessage[], options?: { temperature?: number; maxTokens?: number }): Promise<string>;
}

export class GroqProvider implements AIProvider {
  readonly name = 'Groq';
  private apiKey: string;
  private primaryModel: string;
  private fallbackModels: string[];

  constructor(apiKey?: string, model: string = 'qwen/qwen3.8-27b') {
    this.apiKey = apiKey || process.env.GROQ_API_KEY || '';
    this.primaryModel = model;
    this.fallbackModels = ['openai/gpt-oss-120b', 'groq/compound', 'groq/compound-mini'];
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0 && !this.apiKey.includes('your_'));
  }

  async generateChat(messages: ChatMessage[], options?: { temperature?: number; maxTokens?: number }): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Groq API key is not configured.');
    }

    const modelsToTry = [this.primaryModel, ...this.fallbackModels];
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey.trim()}`
          },
          body: JSON.stringify({
            model,
            messages: messages.map((m) => ({
              role: m.role,
              content: m.content
            })),
            temperature: options?.temperature ?? 0.7,
            max_tokens: options?.maxTokens ?? 2048
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = (errData as any)?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
          throw new Error(`Groq (${model}) error: ${errMsg}`);
        }

        const data = (await res.json()) as any;
        const text = data?.choices?.[0]?.message?.content;
        if (typeof text === 'string' && text.trim().length > 0) {
          return text.trim();
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Groq model ${model} attempt failed:`, err?.message || err);
        // Continue to next fallback model if any
      }
    }

    throw lastError || new Error('Groq generation returned empty response across all models.');
  }
}

export class GeminiProvider implements AIProvider {
  readonly name = 'Gemini';
  private apiKey: string;
  private primaryModel: string;
  private fallbackModels: string[];

  constructor(apiKey?: string, model: string = 'gemini-2.5-flash') {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    this.primaryModel = model;
    this.fallbackModels = ['gemini-flash-latest', 'gemini-2.5-pro', 'gemini-flash-lite-latest', 'gemini-3.5-flash'];
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0 && !this.apiKey.includes('your_'));
  }

  async generateChat(messages: ChatMessage[], options?: { temperature?: number; maxTokens?: number }): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Gemini API key is not configured.');
    }

    // Separate system instructions from conversational turns
    const systemMessages = messages.filter((m) => m.role === 'system');
    const systemInstruction = systemMessages.map((m) => m.content).join('\n\n');

    const conversationMessages = messages.filter((m) => m.role !== 'system');

    // Build Gemini contents array
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Ensure alternating user/model turns as required by Gemini
    for (const msg of conversationMessages) {
      const geminiRole = msg.role === 'assistant' ? 'model' : 'user';
      if (contents.length > 0 && contents[contents.length - 1].role === geminiRole) {
        contents[contents.length - 1].parts.push({ text: msg.content });
      } else {
        contents.push({
          role: geminiRole,
          parts: [{ text: msg.content }]
        });
      }
    }

    // Fallback if contents is empty
    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: 'Hello' }] });
    }

    const modelsToTry = [this.primaryModel, ...this.fallbackModels];
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const body: any = {
          contents,
          generationConfig: {
            temperature: options?.temperature ?? 0.7,
            maxOutputTokens: options?.maxTokens ?? 2048
          }
        };

        if (systemInstruction) {
          body.systemInstruction = {
            parts: [{ text: systemInstruction }]
          };
        }

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey.trim()}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          }
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = (errData as any)?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
          throw new Error(`Gemini (${model}) error: ${errMsg}`);
        }

        const data = (await res.json()) as any;
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (typeof text === 'string' && text.trim().length > 0) {
          return text.trim();
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Gemini model ${model} attempt failed:`, err?.message || err);
      }
    }

    throw lastError || new Error('Gemini generation returned empty response across all models.');
  }
}

export class OpenAIProvider implements AIProvider {
  readonly name = 'OpenAI';
  private apiKey: string;
  private primaryModel: string;

  constructor(apiKey?: string, model: string = 'gpt-4o-mini') {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    this.primaryModel = model;
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0 && !this.apiKey.includes('your_'));
  }

  async generateChat(messages: ChatMessage[], options?: { temperature?: number; maxTokens?: number }): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('OpenAI API key is not configured.');
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey.trim()}`
      },
      body: JSON.stringify({
        model: this.primaryModel,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content
        })),
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2048
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const errMsg = (errData as any)?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
      throw new Error(`OpenAI error: ${errMsg}`);
    }

    const data = (await res.json()) as any;
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text === 'string' && text.trim().length > 0) {
      return text.trim();
    }
    throw new Error('OpenAI returned empty response.');
  }
}

/**
 * Unified AI Provider with automatic fallback across configured providers
 */
export class UnifiedAIProvider {
  private providers: AIProvider[] = [];

  constructor() {
    this.refreshProviders();
  }

  refreshProviders() {
    const list: AIProvider[] = [];

    // Prioritize Groq for high-speed inference if available
    const groq = new GroqProvider();
    if (groq.isAvailable()) list.push(groq);

    // Add Gemini as robust secondary provider
    const gemini = new GeminiProvider();
    if (gemini.isAvailable()) list.push(gemini);

    // Add OpenAI if configured
    const openai = new OpenAIProvider();
    if (openai.isAvailable()) list.push(openai);

    this.providers = list;
    console.log(
      `[AI Provider] Initialized ${list.length} active provider(s):`,
      list.map((p) => p.name).join(', ') || 'NONE'
    );
  }

  getActiveProviders(): string[] {
    return this.providers.map((p) => p.name);
  }

  async generateChat(messages: ChatMessage[], options?: { temperature?: number; maxTokens?: number }): Promise<{ text: string; provider: string }> {
    if (this.providers.length === 0) {
      // Check if keys were loaded late into env
      this.refreshProviders();
    }

    if (this.providers.length === 0) {
      throw new Error(
        'No AI provider API key is configured. Please provide GROQ_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY in backend/.env.'
      );
    }

    const errors: string[] = [];

    for (const provider of this.providers) {
      try {
        const text = await provider.generateChat(messages, options);
        return { text, provider: provider.name };
      } catch (err: any) {
        const msg = err?.message || String(err);
        console.warn(`[AI Provider] Provider ${provider.name} failed: ${msg}. Attempting fallback...`);
        errors.push(`${provider.name}: ${msg}`);
      }
    }

    throw new Error(`All configured AI providers failed:\n${errors.join('\n')}`);
  }
}

export const unifiedAI = new UnifiedAIProvider();
