"use client";
import { useState, useEffect, useRef, useCallback } from "react";

export function useWebSocket<T>(url: string, initialData: T | null = null) {
  const [data, setData] = useState<T | null>(initialData);
  const [isConnected, setIsConnected] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);
  
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const mockInterval = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const isMounted = useRef(true);

  const startMockData = useCallback(() => {
    if (mockInterval.current) return;
    setIsMockMode(true);
    
    const isTelemetry = url.includes("telemetry");
    
    mockInterval.current = setInterval(() => {
      if (!isMounted.current) return;
      if (isTelemetry) {
        setData({
          timestamp: new Date().toISOString(),
          zone_temp_c: 24.0 + (Math.random() * 0.5 - 0.25),
          zone_co2_ppm: 450.0 + (Math.random() * 10 - 5),
          iaq_score: 95.0 + (Math.random() * 2 - 1),
          outdoor_temp_c: 30.0,
          chiller_load_kw: 15.0 + (Math.random() * 2 - 1),
          hvac_mode: "cooling",
        } as unknown as T);
      } else {
        setData({
          agent: "EcoLoop-AI",
          action: "Mock Fallback: Action Not Live",
          reasoning: "Backend is disconnected. Falling back to local simulated stream.",
          timestamp: new Date().toISOString(),
        } as unknown as T);
      }
    }, 2000);
  }, [url]);

  const connect = useCallback(() => {
    if (!isMounted.current) return;
    
    try {
      ws.current = new WebSocket(url);
      
      ws.current.onopen = () => {
        setIsConnected(true);
        setIsMockMode(false);
        reconnectAttempts.current = 0;
        if (mockInterval.current) {
          clearInterval(mockInterval.current);
          mockInterval.current = null;
        }
      };
      
      ws.current.onclose = () => {
        setIsConnected(false);
        if (isMounted.current) {
          startMockData();
          const delay = Math.min(1000 * (2 ** reconnectAttempts.current), 30000);
          reconnectAttempts.current++;
          reconnectTimeout.current = setTimeout(connect, delay);
        }
      };
      ws.current.onerror = (e) => {
        // Silently handle to prevent Next.js dev overlay from catching console.error
      };
      
      ws.current.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          setData(parsed);
        } catch (e) {
          console.error("Failed to parse WS data", e);
        }
      };
    } catch (e) {
      // Silently start mock data
      startMockData();
    }
  }, [url, startMockData]);

  useEffect(() => {
    isMounted.current = true;
    connect();
    
    return () => {
      isMounted.current = false;
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (mockInterval.current) clearInterval(mockInterval.current);
      if (ws.current) {
        ws.current.onclose = null; // Prevent reconnect on unmount
        ws.current.close();
      }
    };
  }, [connect]);

  return { data, isConnected, isMockMode };
}
