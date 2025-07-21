"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { FlashMessage } from "@/lib/types";

interface FlashMessageContextType {
  messages: FlashMessage[];
  addMessage: (type: FlashMessage["type"], message: string) => void;
  removeMessage: (id: string) => void;
  clearMessages: () => void;
}

const FlashMessageContext = createContext<FlashMessageContextType | undefined>(
  undefined
);

export function useFlashMessages() {
  const context = useContext(FlashMessageContext);
  if (!context) {
    throw new Error(
      "useFlashMessages must be used within a FlashMessageProvider"
    );
  }
  return context;
}

interface FlashMessageProviderProps {
  children: React.ReactNode;
}

export function FlashMessageProvider({ children }: FlashMessageProviderProps) {
  const [messages, setMessages] = useState<FlashMessage[]>([]);

  const removeMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  const addMessage = useCallback(
    (type: FlashMessage["type"], message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newMessage: FlashMessage = {
        id,
        type,
        message,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, newMessage]);

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        removeMessage(id);
      }, 5000);
    },
    [removeMessage]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <FlashMessageContext.Provider
      value={{
        messages,
        addMessage,
        removeMessage,
        clearMessages,
      }}
    >
      {children}
    </FlashMessageContext.Provider>
  );
}
