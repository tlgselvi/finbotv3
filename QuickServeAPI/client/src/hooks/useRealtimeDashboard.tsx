import { useEffect, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { logger } from '@/lib/logger';

interface DashboardUpdate {
  type: 'connected' | 'dashboard_update';
  data?: any;
  timestamp: number;
}

export function useRealtimeDashboard () {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      return;
    }

    // Get token for authentication
    const token = localStorage.getItem('token');
    if (!token) {
      logger.warn('No token available for real-time connection');
      return;
    }

    // Disable real-time in development due to SSE endpoint issues
    if (import.meta.env.DEV) {
      logger.info('[REALTIME] Disabled in development mode');
      setIsConnected(false);
      return;
    }

    // Create EventSource connection with token in URL
    const eventSource = new EventSource(`/api/dashboard/stream?token=${token}`, {
      withCredentials: true,
    });

    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setConnectionError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const update: DashboardUpdate = JSON.parse(event.data);

        if (update.type === 'connected') {
          logger.info('Connected to real-time dashboard updates');
        } else if (update.type === 'dashboard_update' && update.data) {
          // Update the dashboard query cache with fresh data
          queryClient.setQueryData(['/api/dashboard'], update.data);
        }
      } catch (error) {
        logger.error('Error parsing real-time update:', error);
      }
    };

    eventSource.onerror = (error) => {
      logger.error('Real-time connection error:', error);
      setIsConnected(false);
      setConnectionError('Bağlantı hatası');

      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        // The useEffect will run again and create a new connection
      }, 5000);
    };

    // Cleanup function
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
    };
  }, [user, queryClient]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const reconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    // Trigger reconnection by updating user dependency
    setIsConnected(false);
    setConnectionError(null);
  };

  return {
    isConnected,
    connectionError,
    reconnect,
  };
}

