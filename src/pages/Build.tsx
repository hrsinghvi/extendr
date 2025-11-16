import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Send, Paperclip, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Build() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/");
      } else {
        setIsLoading(false);
        
        // If there's a prompt from the hero section, add it
        if (location.state?.prompt) {
          setMessages([{ role: "user", content: location.state.prompt }]);
          setIsThinking(true);
          // Simulate AI thinking
          setTimeout(() => {
            setIsThinking(false);
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: "I'm ready to help you build your app! Let me start by understanding your requirements better...",
              },
            ]);
          }, 2000);
        }
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: inputValue }]);
    setInputValue("");
    setIsThinking(true);

    // Simulate AI response
    setTimeout(() => {
      setIsThinking(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I understand. Let me help you with that...",
        },
      ]);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#1a1a1a] flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="h-14 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 flex items-center justify-center">
            <div className="w-5 h-5 bg-gradient-to-br from-orange-400 to-pink-500 rounded-md transform rotate-45"></div>
          </div>
          <span className="text-white font-semibold italic">bolt</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-[#2a2a2a]"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Chat */}
        <div className="w-[450px] bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col">
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500 text-sm">Start a conversation...</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-[#2a2a2a] text-white"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))
            )}
            {isThinking && (
              <div className="flex items-center gap-2 text-gray-400">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
                <span className="text-sm">Thinking...</span>
              </div>
            )}
          </div>

          {/* Chat input */}
          <div className="p-4 border-t border-[#2a2a2a]">
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask Lovable..."
                className="w-full bg-[#2a2a2a] text-white rounded-lg pl-4 pr-20 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button className="p-1.5 hover:bg-[#3a3a3a] rounded-md transition-colors">
                  <Paperclip className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="p-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md transition-colors"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <button className="text-xs text-gray-500 hover:text-gray-400 transition-colors">
                Visual edits
              </button>
              <button className="text-xs text-gray-500 hover:text-gray-400 transition-colors">
                Chat
              </button>
            </div>
          </div>
        </div>

        {/* Right side - Preview */}
        <div className="flex-1 bg-[#0c1111] flex items-center justify-center">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-orange-500/20 via-pink-500/20 to-purple-600/20 flex items-center justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500/30 to-pink-500/30 rounded-xl transform rotate-45"></div>
              </div>
            </div>
            <p className="text-gray-500 text-lg">Your preview will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
}

