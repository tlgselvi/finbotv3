// @ts-nocheck - Temporary fix for TypeScript errors
import { EventEmitter } from 'events';
import { logger } from '../../utils/logger';
export class RealtimeEventBus extends EventEmitter {
    static instance;
    subscriptions = new Map();
    eventHistory = new Map();
    maxHistorySize = 1000;
    constructor() {
        super();
        this.setMaxListeners(1000);
        // Cleanup inactive subscriptions every 5 minutes
        setInterval(() => {
            this.cleanupInactiveSubscriptions();
        }, 5 * 60 * 1000);
    }
    static getInstance() {
        if (!RealtimeEventBus.instance) {
            RealtimeEventBus.instance = new RealtimeEventBus();
        }
        return RealtimeEventBus.instance;
    }
    /**
     * Publish an event to subscribers
     */
    publish(event) {
        const realtimeEvent = {
            ...event,
            id: this.generateEventId(),
            timestamp: new Date(),
        };
        // Store in history
        this.storeEventInHistory(realtimeEvent);
        // Emit to all listeners
        this.emit('event', realtimeEvent);
        // Emit to specific topic listeners
        this.emit(`topic:${realtimeEvent.topic}`, realtimeEvent);
        // Emit to user-specific listeners if userId is provided
        if (realtimeEvent.userId) {
            this.emit(`user:${realtimeEvent.userId}`, realtimeEvent);
        }
        // Log the event
        logger.info(`[REALTIME] Event published:`, {
            id: realtimeEvent.id,
            type: realtimeEvent.type,
            topic: realtimeEvent.topic,
            userId: realtimeEvent.userId,
            timestamp: realtimeEvent.timestamp,
        });
    }
    /**
     * Subscribe to events for a user
     */
    subscribe(userId, topics, socketId) {
        const subscriptionId = this.generateSubscriptionId();
        const subscription = {
            id: subscriptionId,
            userId,
            topics,
            socketId,
            lastActivity: new Date(),
            isActive: true,
        };
        this.subscriptions.set(subscriptionId, subscription);
        logger.info(`[REALTIME] User ${userId} subscribed to topics:`, topics);
        return subscriptionId;
    }
    /**
     * Unsubscribe from events
     */
    unsubscribe(subscriptionId) {
        const subscription = this.subscriptions.get(subscriptionId);
        if (subscription) {
            subscription.isActive = false;
            this.subscriptions.delete(subscriptionId);
            logger.info(`[REALTIME] Unsubscribed:`, subscriptionId);
            return true;
        }
        return false;
    }
    /**
     * Update subscription activity
     */
    updateActivity(subscriptionId) {
        const subscription = this.subscriptions.get(subscriptionId);
        if (subscription) {
            subscription.lastActivity = new Date();
        }
    }
    /**
     * Get active subscriptions for a user
     */
    getUserSubscriptions(userId) {
        return Array.from(this.subscriptions.values()).filter(sub => sub.userId === userId && sub.isActive);
    }
    /**
     * Get event history for a topic
     */
    getEventHistory(topic, limit = 50) {
        const history = this.eventHistory.get(topic) || [];
        return history.slice(-limit);
    }
    /**
     * Get events for a user since a specific timestamp
     */
    getEventsForUser(userId, since, topics) {
        const userEvents = [];
        for (const [topic, events] of this.eventHistory.entries()) {
            if (topics && !topics.includes(topic))
                continue;
            const filteredEvents = events.filter(event => {
                if (event.userId !== userId)
                    return false;
                if (since && event.timestamp < since)
                    return false;
                return true;
            });
            userEvents.push(...filteredEvents);
        }
        // Sort by timestamp
        return userEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }
    /**
     * Cleanup inactive subscriptions
     */
    cleanupInactiveSubscriptions() {
        const now = new Date();
        const inactiveThreshold = 30 * 60 * 1000; // 30 minutes
        for (const [subscriptionId, subscription] of this.subscriptions.entries()) {
            if (subscription.isActive &&
                now.getTime() - subscription.lastActivity.getTime() > inactiveThreshold) {
                subscription.isActive = false;
                this.subscriptions.delete(subscriptionId);
                logger.info(`[REALTIME] Cleaned up inactive subscription:`, subscriptionId);
            }
        }
    }
    /**
     * Store event in history
     */
    storeEventInHistory(event) {
        const history = this.eventHistory.get(event.topic) || [];
        history.push(event);
        // Keep only the last maxHistorySize events
        if (history.length > this.maxHistorySize) {
            history.splice(0, history.length - this.maxHistorySize);
        }
        this.eventHistory.set(event.topic, history);
    }
    /**
     * Generate unique event ID
     */
    generateEventId() {
        return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Generate unique subscription ID
     */
    generateSubscriptionId() {
        return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Get subscription statistics
     */
    getStats() {
        const activeSubscriptions = Array.from(this.subscriptions.values()).filter(sub => sub.isActive).length;
        const totalTopics = this.eventHistory.size;
        let totalEvents = 0;
        for (const events of this.eventHistory.values()) {
            totalEvents += events.length;
        }
        const averageEventsPerTopic = totalTopics > 0 ? totalEvents / totalTopics : 0;
        return {
            activeSubscriptions,
            totalTopics,
            totalEvents,
            averageEventsPerTopic,
        };
    }
}
// Export singleton instance
export const eventBus = RealtimeEventBus.getInstance();
// Event types
export const REALTIME_EVENTS = {
    // Dashboard events
    DASHBOARD_WIDGET_UPDATED: 'dashboard.widget.updated',
    DASHBOARD_LAYOUT_CHANGED: 'dashboard.layout.changed',
    // Financial events
    AGING_DATA_UPDATED: 'finance.aging.updated',
    RUNWAY_DATA_UPDATED: 'finance.runway.updated',
    CASHGAP_DATA_UPDATED: 'finance.cashgap.updated',
    FINANCIAL_HEALTH_UPDATED: 'finance.health.updated',
    // Account events
    ACCOUNT_CREATED: 'account.created',
    ACCOUNT_UPDATED: 'account.updated',
    ACCOUNT_DELETED: 'account.deleted',
    // Transaction events
    TRANSACTION_CREATED: 'transaction.created',
    TRANSACTION_UPDATED: 'transaction.updated',
    TRANSACTION_DELETED: 'transaction.deleted',
    // System events
    SYSTEM_MAINTENANCE: 'system.maintenance',
    SYSTEM_ERROR: 'system.error',
    USER_LOGIN: 'user.login',
    USER_LOGOUT: 'user.logout',
};
// Topic patterns
export const REALTIME_TOPICS = {
    USER_DASHBOARD: (userId) => `user.${userId}.dashboard`,
    USER_FINANCE: (userId) => `user.${userId}.finance`,
    USER_ACCOUNTS: (userId) => `user.${userId}.accounts`,
    USER_TRANSACTIONS: (userId) => `user.${userId}.transactions`,
    SYSTEM_GLOBAL: 'system.global',
    SYSTEM_ADMIN: 'system.admin',
};
// Helper function to publish dashboard events
export function publishDashboardEvent(userId, eventType, data, metadata) {
    eventBus.publish({
        type: eventType,
        userId,
        topic: REALTIME_TOPICS.USER_DASHBOARD(userId),
        data,
        metadata,
    });
}
// Helper function to publish financial events
export function publishFinancialEvent(userId, eventType, data, metadata) {
    eventBus.publish({
        type: eventType,
        userId,
        topic: REALTIME_TOPICS.USER_FINANCE(userId),
        data,
        metadata,
    });
}
