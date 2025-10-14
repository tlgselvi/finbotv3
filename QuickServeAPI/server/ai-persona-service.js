// @ts-nocheck - Temporary fix for TypeScript errors
import { randomUUID } from 'crypto';
export class AIPersonaService {
    static personas = [
        {
            id: 'accountant',
            name: 'Muhasebeci AI',
            role: 'Muhasebe Uzmanı',
            description: 'Finansal kayıt tutma, bütçe analizi ve vergi konularında uzman',
            systemPrompt: `Sen deneyimli bir muhasebeci ve finansal danışmansın. Türkiye'deki muhasebe standartlarına hakimsin ve şirketlerin finansal sağlığını değerlendirme konusunda uzmanlığın var.

Görevlerin:
- Finansal kayıtları analiz etmek
- Bütçe ve nakit akışı önerileri sunmak
- Vergi optimizasyonu konularında danışmanlık yapmak
- Mali tabloları yorumlamak
- Finansal riskleri değerlendirmek

Yaklaşımın: Detaylı, analitik ve mevzuata uygun. Her önerini somut verilerle destekle.`,
            expertise: ['muhasebe', 'vergi', 'bütçe', 'nakit akışı', 'mali tablolar'],
            tone: 'profesyonel',
        },
        {
            id: 'ceo',
            name: 'CEO AI',
            role: 'Genel Müdür',
            description: 'Stratejik karar verme, büyüme planlama ve liderlik konularında uzman',
            systemPrompt: `Sen başarılı bir CEO'sun ve şirket yönetimi konusunda geniş deneyime sahipsin. Stratejik düşünme, büyüme planlama ve liderlik konularında uzmanlığın var.

Görevlerin:
- Stratejik kararlar almak
- Büyüme fırsatlarını değerlendirmek
- Pazar analizi yapmak
- Kaynak tahsisi önerileri sunmak
- Risk yönetimi stratejileri geliştirmek

Yaklaşımın: Stratejik, vizyoner ve sonuç odaklı. Büyük resmi gör ve uzun vadeli düşün.`,
            expertise: [
                'strateji',
                'büyüme',
                'pazar analizi',
                'liderlik',
                'risk yönetimi',
            ],
            tone: 'vizyoner',
        },
        {
            id: 'investor',
            name: 'Yatırımcı AI',
            role: 'Yatırım Uzmanı',
            description: 'Portföy yönetimi, risk analizi ve yatırım stratejileri konularında uzman',
            systemPrompt: `Sen deneyimli bir yatırım uzmanısın ve portföy yönetimi, risk analizi konularında uzmanlığın var. Farklı yatırım araçlarını ve piyasa dinamiklerini iyi biliyorsun.

Görevlerin:
- Portföy performansını analiz etmek
- Yatırım fırsatlarını değerlendirmek
- Risk-getiri analizi yapmak
- Varlık dağılımı önerileri sunmak
- Piyasa trendlerini yorumlamak

Yaklaşımın: Analitik, risk bilinci yüksek ve veri odaklı. Her yatırım kararını risk-getiri perspektifiyle değerlendir.`,
            expertise: [
                'portföy',
                'risk analizi',
                'yatırım',
                'getiri',
                'varlık dağılımı',
            ],
            tone: 'analitik',
        },
    ];
    /**
     * Get all available personas
     */
    static getPersonas() {
        return this.personas;
    }
    /**
     * Get specific persona by ID
     */
    static getPersona(id) {
        return this.personas.find(p => p.id === id);
    }
    /**
     * Generate AI response based on persona and user query
     */
    static async generateResponse(personaId, userMessage, context) {
        const persona = this.getPersona(personaId);
        if (!persona) {
            throw new Error(`Persona with ID ${personaId} not found`);
        }
        // Simulate AI response generation
        // In a real implementation, this would call an AI service (OpenAI, Claude, etc.)
        const response = await this.simulateAIResponse(persona, userMessage, context);
        return {
            response: response.message,
            reasoning: response.reasoning,
        };
    }
    /**
     * Simulate AI response (placeholder for real AI integration)
     */
    static async simulateAIResponse(persona, userMessage, context) {
        // This is a simplified simulation
        // In production, this would integrate with OpenAI, Claude, or other AI services
        const responses = {
            accountant: {
                message: `Muhasebe perspektifinden bakıldığında, ${userMessage} konusunda detaylı bir analiz yapılması gerekiyor. Finansal kayıtlarınızı inceleyerek size özel öneriler sunabilirim.`,
                reasoning: 'Muhasebe uzmanı olarak finansal verileri analiz etmek ve mevzuata uygun öneriler sunmak gerekiyor.',
            },
            ceo: {
                message: `Stratejik açıdan değerlendirdiğimde, ${userMessage} konusu şirketin büyüme planları için önemli bir fırsat sunabilir. Detaylı bir pazar analizi yaparak stratejik kararlar alabiliriz.`,
                reasoning: 'CEO perspektifinden büyük resmi görerek stratejik kararlar almak ve büyüme fırsatlarını değerlendirmek önemli.',
            },
            investor: {
                message: `Yatırım uzmanı olarak, ${userMessage} konusunu risk-getiri perspektifinden değerlendirmek gerekiyor. Portföyünüzün performansını analiz ederek optimal yatırım stratejileri önerebilirim.`,
                reasoning: 'Yatırım uzmanı olarak risk analizi yapmak ve portföy optimizasyonu önerileri sunmak gerekiyor.',
            },
        };
        const personaResponse = responses[persona.id];
        return (personaResponse || {
            message: `Merhaba! ${persona.name} olarak size nasıl yardımcı olabilirim?`,
            reasoning: 'Genel bir karşılama mesajı veriliyor.',
        });
    }
    /**
     * Save decision history
     */
    static saveDecision(userId, personaId, decision, reasoning, outcome, metadata) {
        const decisionRecord = {
            id: randomUUID(),
            userId,
            personaId,
            decision,
            reasoning,
            outcome,
            timestamp: new Date(),
            metadata,
        };
        // In a real implementation, this would save to database
        // For now, we'll just return the record
        return decisionRecord;
    }
    /**
     * Get decision history for a user
     */
    static getDecisionHistory(userId, limit) {
        // In a real implementation, this would query the database
        // For now, return empty array
        return [];
    }
    /**
     * Route to appropriate AI service based on complexity
     */
    static async routeToAIService(query, persona) {
        // Simple routing logic based on query complexity and persona
        const complexity = this.analyzeQueryComplexity(query);
        if (complexity > 0.7) {
            return { service: 'gpt-4', confidence: 0.9 };
        }
        else if (complexity > 0.4) {
            return { service: 'claude', confidence: 0.8 };
        }
        else {
            return { service: 'gpt-3.5', confidence: 0.7 };
        }
    }
    /**
     * Analyze query complexity (simplified)
     */
    static analyzeQueryComplexity(query) {
        const complexKeywords = [
            'analiz',
            'strateji',
            'optimizasyon',
            'risk',
            'portföy',
            'yatırım',
            'finansal model',
            'simülasyon',
            'tahmin',
        ];
        const keywordCount = complexKeywords.filter(keyword => query.toLowerCase().includes(keyword)).length;
        return Math.min(keywordCount / complexKeywords.length, 1);
    }
    /**
     * Get persona-specific recommendations
     */
    static getPersonaRecommendations(personaId, financialData) {
        const persona = this.getPersona(personaId);
        if (!persona) {
            return [];
        }
        const recommendations = {
            accountant: [
                'Aylık bütçe raporlarını düzenli olarak inceleyin',
                'Vergi optimizasyonu için profesyonel danışmanlık alın',
                'Nakit akışı tahminlerini güncelleyin',
                'Mali tabloları üç aylık periyotlarda analiz edin',
            ],
            ceo: [
                'Stratejik büyüme planlarını gözden geçirin',
                'Pazar fırsatlarını değerlendirin',
                'Operasyonel verimliliği artırın',
                'Rekabet analizi yapın',
            ],
            investor: [
                'Portföy çeşitlendirmesini gözden geçirin',
                'Risk-getiri analizi yapın',
                'Piyasa trendlerini takip edin',
                'Yatırım hedeflerinizi netleştirin',
            ],
        };
        return recommendations[personaId] || [];
    }
}
