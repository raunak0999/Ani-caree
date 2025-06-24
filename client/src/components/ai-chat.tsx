// client/src/components/AiChat.tsx
import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ChatMessageType } from "@/lib/types";

export default function AiChat() {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: '1',
      text: "...Greet your user...",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { data: petData } = useQuery({
    queryKey: ["pet-profile"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/pet-profiles");
      if (!res.ok) throw new Error("No pet profile found");
      return res.json();
    },
    retry: false,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/chat", {
        message,
        sessionId,
        petContext: petData ? JSON.stringify(petData.profile) : undefined,
      });
      const json = await res.json();
      // Save chat history
      await apiRequest("POST", "/api/chat-messages", {
        sessionId,
        message,
        response: json.response,
      });
      return json;
    },
    onSuccess: (data) => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: data.response,
          isUser: false,
          timestamp: new Date()
        }
      ]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const userMsg: ChatMessageType = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    sendMessageMutation.mutate(inputMessage);
    setInputMessage("");
  };

  return (
    <section>… your card UI without mic button …</section>
  );
}
