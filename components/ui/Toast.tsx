"use client";

import { createContext, useCallback, useContext, useState } from "react";

interface ToastMessage {
  id: number;
  text: string;
  type: "success" | "error" | "info";
  leaving?: boolean;
}

interface ToastContextValue {
  toast: (text: string, type?: ToastMessage["type"]) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const toast = useCallback((text: string, type: ToastMessage["type"] = "success") => {
    const id = nextId++;
    setMessages((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, leaving: true } : m))
      );
      setTimeout(() => {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      }, 200);
    }, 2500);
  }, []);

  const bgMap = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`${bgMap[m.type]} text-white px-4 py-2 rounded shadow-lg text-sm ${
              m.leaving ? "animate-toast-out" : "animate-toast-in"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
