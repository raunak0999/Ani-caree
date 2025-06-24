import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
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
      text: "Hello! I'm your AI pet care assistant. Ask me anything about nutrition, health, training, or products for your pet.",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/chat", {
        message,
        sessionId,
      });

      if (!res.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await res.json();
      return data.response; // 👈 must match `{ response: string }` from backend
    },
    onSuccess: (reply: string) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: reply,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Something went wrong. Try again!",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    sendMessageMutation.mutate(inputMessage);
    setInputMessage("");
  };

  const quickSuggestions = [
    "What should I feed my puppy?",
    "How often should I bathe my dog?",
    "Signs of illness in cats",
    "Tips for training a rescue dog",
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <section id="chatbot" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">AI Pet Care Assistant</h2>
          <p className="text-xl text-gray-600">Get expert help instantly for your pet questions</p>
        </div>

        <Card className="bg-white shadow-lg overflow-hidden">
          <div className="gradient-bg text-white p-6">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 rounded-full p-3 mr-4">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">AniCare AI Assistant</h3>
                <p className="text-orange-100">Trained on pet care best practices</p>
              </div>
            </div>
          </div>

          <div className="chat-container p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${message.isUser ? "justify-end" : ""}`}
              >
                {!message.isUser && (
                  <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`rounded-lg p-3 max-w-sm ${
                    message.isUser ? "bg-primary text-white" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p>{message.text}</p>
                </div>

                {message.isUser && (
                  <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {sendMessageMutation.isPending && (
              <div className="flex items-start space-x-3">
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3 max-w-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-6">
            <div className="flex space-x-3 mb-4">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about food, health, grooming, or training..."
                className="flex-1"
                disabled={sendMessageMutation.isPending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || sendMessageMutation.isPending}
                className="bg-primary text-white hover:bg-orange-600 transition-colors"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
