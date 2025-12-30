/**
 * Analytics and monitoring utilities
 */

import { logger, performanceMonitor } from './logger';

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

export interface UserProperties {
  wallet?: string;
  network?: string;
  userAgent?: string;
  language?: string;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private userProperties: UserProperties = {};
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';
  }

  // Set user properties
  setUserProperties(properties: UserProperties): void {
    this.userProperties = { ...this.userProperties, ...properties };
    logger.info('User properties updated', { properties: this.userProperties });
  }

  // Track events
  track(eventName: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        ...this.userProperties,
      },
      timestamp: Date.now(),
    };

    this.events.push(event);
    logger.info(`Analytics event: ${eventName}`, { properties: event.properties });

    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalyticsService(event);
    }
  }

  // Track page views
  trackPageView(page: string, properties?: Record<string, any>): void {
    this.track('page_view', {
      page,
      ...properties,
    });
  }

  // Track user actions
  trackUserAction(action: string, properties?: Record<string, any>): void {
    this.track('user_action', {
      action,
      ...properties,
    });
  }

  // Track business events
  trackBusinessEvent(event: string, properties?: Record<string, any>): void {
    this.track('business_event', {
      event,
      ...properties,
    });
  }

  // Track errors
  trackError(error: Error, context?: Record<string, any>): void {
    this.track('error', {
      error_message: error.message,
      error_stack: error.stack,
      ...context,
    });
  }

  // Track performance
  trackPerformance(metric: string, value: number, properties?: Record<string, any>): void {
    this.track('performance', {
      metric,
      value,
      ...properties,
    });
  }

  // Track token creation
  trackTokenCreation(properties: {
    tokenName: string;
    tokenSymbol: string;
    totalSupply: string;
    success: boolean;
    error?: string;
  }): void {
    this.track('token_creation', {
      ...properties,
      timestamp: Date.now(),
    });
  }

  // Track swap events
  trackSwap(properties: {
    inputToken: string;
    outputToken: string;
    amount: string;
    success: boolean;
    error?: string;
  }): void {
    this.track('swap', {
      ...properties,
      timestamp: Date.now(),
    });
  }

  // Track wallet connection
  trackWalletConnection(properties: {
    walletType: string;
    success: boolean;
    error?: string;
  }): void {
    this.track('wallet_connection', {
      ...properties,
      timestamp: Date.now(),
    });
  }

  // Send to analytics service
  private async sendToAnalyticsService(event: AnalyticsEvent): Promise<void> {
    try {
      // Example: Send to your analytics service
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event)
      // });
    } catch (error) {
      logger.error('Failed to send analytics event', error as Error);
    }
  }

  // Get events for debugging
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  // Clear events
  clearEvents(): void {
    this.events = [];
  }
}

export const analytics = new Analytics();

// Performance monitoring hooks
export const usePerformanceMonitor = () => {
  const startTimer = (operation: string) => {
    performanceMonitor.start(operation);
  };

  const endTimer = (operation: string, context?: Record<string, any>) => {
    return performanceMonitor.end(operation, context);
  };

  const measure = <T>(operation: string, fn: () => T, context?: Record<string, any>): T => {
    return performanceMonitor.measure(operation, fn, context);
  };

  const measureAsync = <T>(
    operation: string,
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> => {
    return performanceMonitor.measureAsync(operation, fn, context);
  };

  return {
    startTimer,
    endTimer,
    measure,
    measureAsync,
  };
};

// Analytics hooks for React components
export const useAnalytics = () => {
  const track = (eventName: string, properties?: Record<string, any>) => {
    analytics.track(eventName, properties);
  };

  const trackPageView = (page: string, properties?: Record<string, any>) => {
    analytics.trackPageView(page, properties);
  };

  const trackUserAction = (action: string, properties?: Record<string, any>) => {
    analytics.trackUserAction(action, properties);
  };

  const trackError = (error: Error, context?: Record<string, any>) => {
    analytics.trackError(error, context);
  };

  return {
    track,
    trackPageView,
    trackUserAction,
    trackError,
  };
};
