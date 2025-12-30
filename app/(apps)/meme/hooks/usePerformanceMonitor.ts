'use client';

import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
}

interface PerformanceMonitorOptions {
  enabled?: boolean;
  logToConsole?: boolean;
  threshold?: number; // Log if render time exceeds threshold (ms)
}

export function usePerformanceMonitor(
  componentName: string,
  options: PerformanceMonitorOptions = {}
) {
  const {
    enabled = process.env.NODE_ENV === 'development',
    logToConsole = true,
    threshold = 16 // 16ms = 60fps
  } = options;

  const renderStartTime = useRef<number>(0);
  const metricsRef = useRef<PerformanceMetrics[]>([]);

  const startRender = useCallback(() => {
    if (enabled) {
      renderStartTime.current = performance.now();
    }
  }, [enabled]);

  const endRender = useCallback(() => {
    if (enabled && renderStartTime.current > 0) {
      const renderTime = performance.now() - renderStartTime.current;
      
      const metric: PerformanceMetrics = {
        renderTime,
        componentName,
        timestamp: Date.now()
      };

      metricsRef.current.push(metric);

      // Keep only last 100 metrics
      if (metricsRef.current.length > 100) {
        metricsRef.current = metricsRef.current.slice(-100);
      }

      if (logToConsole && renderTime > threshold) {
        console.warn(
          `🐌 Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`
        );
      }

      renderStartTime.current = 0;
    }
  }, [enabled, componentName, logToConsole, threshold]);

  const getMetrics = useCallback(() => {
    return metricsRef.current;
  }, []);

  const getAverageRenderTime = useCallback(() => {
    const metrics = metricsRef.current;
    if (metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, metric) => sum + metric.renderTime, 0);
    return total / metrics.length;
  }, []);

  const clearMetrics = useCallback(() => {
    metricsRef.current = [];
  }, []);

  // Auto-track render time
  useEffect(() => {
    startRender();
    return () => {
      endRender();
    };
  }, [startRender, endRender]);

  return {
    startRender,
    endRender,
    getMetrics,
    getAverageRenderTime,
    clearMetrics
  };
}

// Hook for measuring async operations
export function useAsyncPerformanceMonitor(operationName: string) {
  const startTime = useRef<number>(0);

  const startOperation = useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const endOperation = useCallback((logToConsole = true) => {
    if (startTime.current > 0) {
      const duration = performance.now() - startTime.current;
      
      if (logToConsole && process.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${operationName} completed in ${duration.toFixed(2)}ms`);
      }
      
      startTime.current = 0;
      return duration;
    }
    return 0;
  }, [operationName]);

  return {
    startOperation,
    endOperation
  };
}

// Hook for measuring component mount/unmount performance
export function useMountPerformanceMonitor(componentName: string) {
  const mountTime = useRef<number>(0);

  useEffect(() => {
    mountTime.current = performance.now();
    
    return () => {
      const unmountTime = performance.now();
      const mountDuration = unmountTime - mountTime.current;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `📊 ${componentName} was mounted for ${mountDuration.toFixed(2)}ms`
        );
      }
    };
  }, [componentName]);
}

// Utility for measuring function execution time
export function measureExecutionTime<T>(
  fn: () => T,
  operationName: string = 'Operation'
): T {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`⏱️ ${operationName} executed in ${duration.toFixed(2)}ms`);
  }
  
  return result;
}

// Utility for measuring async function execution time
export async function measureAsyncExecutionTime<T>(
  fn: () => Promise<T>,
  operationName: string = 'Async Operation'
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`⏱️ ${operationName} executed in ${duration.toFixed(2)}ms`);
  }
  
  return result;
}

