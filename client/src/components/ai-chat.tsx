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
      text: "Hello! I'm your AI pet care assistant. I can help you with nutrition advice, training tips, health concerns, and product recommendations. What would you like to know?",
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/chat", {
        message,
        sessionId,
        petContext: petData ? JSON.stringify(petData.profile) : undefined,
      });
      const json = await res.json();

      // Save to /chat-messages
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
    const finalMessage = inputMessage.trim();
    if (!finalMessage) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      text: finalMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    sendMessageMutation.mutate(finalMessage);
    setInputMessage("");
  };

  const quickSuggestions = [
    "Puppy training tips",
    "Senior dog nutrition",
    "Grooming schedule",
    "Health symptoms"
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <section id="chatbot" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">AI Pet Care Assistant</h2>
          <p className="text-xl text-gray-600">Get instant answers to your pet care questions</p>
        </div>

        <Card className="bg-white shadow-lg overflow-hidden">
          <div className="gradient-bg text-white p-6">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 rounded-full p-3 mr-4">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">AniCare AI Assistant</h3>
                <p className="text-orange-100">Ask me anything about your pet's care!</p>
              </div>
            </div>
          </div>

          <div className="chat-container p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex items-start space-x-3 ${message.isUser ? 'justify-end' : ''}`}>
                {!message.isUser && (
                  <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm flex-shrink-0">
