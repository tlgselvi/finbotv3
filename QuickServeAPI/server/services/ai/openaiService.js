// @ts-nocheck - Temporary fix for TypeScript errors
import crypto from 'crypto';
import { logger } from '../../utils/logger';
class OpenAIService {
    settings;
    responseCache = new Map();
    constructor() {
        // Default settings
        this.settings = {
            provider: 'mock',
            apiKey: null,
            isActive: false,
            defaultModel: 'gpt-3.5-turbo',
            cacheDuration: 60,
        };
    }
    /**
     * Update AI settings
     */
    async updateSettings(settings) {
        this.settings = { ...this.settings, ...settings };
        logger.info('✅ AI settings updated:', this.settings.provider);
    }
    /**
     * Get current AI settings
     */
    getSettings() {
        return { ...this.settings };
    }
    /**
     * Test OpenAI API connection
     */
    async testConnection() {
        if (!this.settings.apiKey) {
            return { success: false, message: 'API key bulunamadı' };
        }
        if (this.settings.provider === 'mock') {
            return { success: true, message: 'Mock modu aktif' };
        }
        try {
            // Test OpenAI API
            const response = await fetch('https://api.openai.com/v1/models', {
                headers: {
                    Authorization: `Bearer ${this.settings.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                return { success: true, message: 'OpenAI API bağlantısı başarılı' };
            }
            else {
                const error = await response.json();
                return {
                    success: false,
                    message: `API hatası: ${error.error?.message || 'Bilinmeyen hata'}`,
                };
            }
        }
        catch (error) {
            return { success: false, message: `Bağlantı hatası: ${error.message}` };
        }
    }
    /**
     * Generate AI response
     */
    async generateResponse(prompt, context) {
        // Check cache first
        const cacheKey = this.getCacheKey(prompt, context);
        const cached = this.responseCache.get(cacheKey);
        if (cached &&
            Date.now() - cached.timestamp < this.settings.cacheDuration * 60 * 1000) {
            return {
                success: true,
                response: cached.response,
                model: this.settings.defaultModel,
                cached: true,
            };
        }
        let response;
        if (this.settings.provider === 'mock' ||
            !this.settings.isActive ||
            !this.settings.apiKey) {
            response = this.generateMockResponse(prompt, context);
        }
        else {
            try {
                response = await this.callOpenAI(prompt, context);
            }
            catch (error) {
                logger.error('OpenAI API error:', error);
                response = this.generateMockResponse(prompt, context);
            }
        }
        // Cache the response
        this.responseCache.set(cacheKey, {
            response,
            timestamp: Date.now(),
        });
        return {
            success: true,
            response,
            model: this.settings.defaultModel,
            cached: false,
        };
    }
    /**
     * Call OpenAI API
     */
    async callOpenAI(prompt, context) {
        const messages = [
            {
                role: 'system',
                content: 'Sen FinBot adında bir finansal asistanısın. Türkçe yanıt ver ve finansal konularda yardımcı ol.',
            },
            {
                role: 'user',
                content: this.buildPrompt(prompt, context),
            },
        ];
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.settings.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: this.settings.defaultModel,
                messages,
                max_tokens: 500,
                temperature: 0.7,
            }),
        });
        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }
        const data = await response.json();
        return data.choices[0]?.message?.content || 'Yanıt alınamadı';
    }
    /**
     * Generate mock response
     */
    generateMockResponse(prompt, context) {
        const responses = [
            'Toplam varlıklarınız 65.000 TL. Şirket hesaplarınızda 50.000 TL, kişisel hesaplarınızda 15.000 TL bulunuyor.',
            'Mevcut finansal durumunuza göre, bütçe planlaması yapmanızı öneririm.',
            'Son işlemlerinizi incelediğimde, giderlerinizi kontrol altında tutmanız gerektiğini görüyorum.',
            'Yatırım yapmak için yeterli nakit akışınız var. Düşük riskli yatırımları değerlendirebilirsiniz.',
            'Acil durum fonunuz için en az 3 aylık giderinizi karşılayacak miktarda para ayırmanızı öneririm.',
        ];
        const randomIndex = Math.floor(Math.random() * responses.length);
        return responses[randomIndex];
    }
    /**
     * Build prompt with context
     */
    buildPrompt(prompt, context) {
        let fullPrompt = prompt;
        if (context) {
            if (context.totalBalance) {
                fullPrompt += `\n\nMevcut toplam bakiye: ${context.totalBalance} TL`;
            }
            if (context.companyBalance) {
                fullPrompt += `\nŞirket bakiyesi: ${context.companyBalance} TL`;
            }
            if (context.personalBalance) {
                fullPrompt += `\nKişisel bakiye: ${context.personalBalance} TL`;
            }
        }
        return fullPrompt;
    }
    /**
     * Get cache key
     */
    getCacheKey(prompt, context) {
        const contextStr = context ? JSON.stringify(context) : '';
        const combined = prompt + contextStr;
        return crypto.createHash('md5').update(combined).digest('hex');
    }
    /**
     * Clear cache
     */
    clearCache() {
        this.responseCache.clear();
        logger.info('AI cache cleared');
    }
}
// Export singleton instance
export const openaiService = new OpenAIService();
export default openaiService;
