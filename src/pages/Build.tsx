import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Send, Paperclip, MoreVertical, Code, Eye, Settings, Github, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromptInputBox } from "@/components/ui/prompt-input-box";
import { motion } from "framer-motion";

export default function Build() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [chatWidth, setChatWidth] = useState(450); // Initial chat width in pixels
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // If not authenticated, redirect to home page
        navigate("/");
      } else {
        // If authenticated, allow access to build page
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
  }, [navigate, location]);

  // Drag handling logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const viewportWidth = window.innerWidth;
      const maxWidth = viewportWidth / 2; // Maximum width is 50% of viewport
      const stickyMinWidth = viewportWidth / 5; // Sticky minimum width (1/5 of viewport)
      const closeThreshold = viewportWidth / 10; // Close threshold (1/10 of viewport)
      const cursorX = e.clientX;

      let newWidth;
      if (cursorX >= stickyMinWidth) {
        // Normal dragging when cursor is right of 1/5 line
        newWidth = Math.max(stickyMinWidth, Math.min(maxWidth, cursorX));
      } else if (cursorX > closeThreshold) {
        // Sticky zone: cursor between 1/5 and 1/10, keep chat at 1/5 width
        newWidth = stickyMinWidth;
      } else {
        // Cursor past 1/10 line: close the chat
        newWidth = 0;
      }

      setChatWidth(newWidth);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !e.touches[0]) return;

      const viewportWidth = window.innerWidth;
      const maxWidth = viewportWidth / 2; // Maximum width is 50% of viewport
      const stickyMinWidth = viewportWidth / 5; // Sticky minimum width (1/5 of viewport)
      const closeThreshold = viewportWidth / 10; // Close threshold (1/10 of viewport)
      const cursorX = e.touches[0].clientX;

      let newWidth;
      if (cursorX >= stickyMinWidth) {
        // Normal dragging when cursor is right of 1/5 line
        newWidth = Math.max(stickyMinWidth, Math.min(maxWidth, cursorX));
      } else if (cursorX > closeThreshold) {
        // Sticky zone: cursor between 1/5 and 1/10, keep chat at 1/5 width
        newWidth = stickyMinWidth;
      } else {
        // Cursor past 1/10 line: close the chat
        newWidth = 0;
      }

      setChatWidth(newWidth);
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleTouchStart = () => {
    setIsDragging(true);
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
      <div className="h-14 bg-[#0C1111] border-b border-[#2a2a2a] flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {/* Bolt Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 font-bold text-xl text-white hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <Send className="w-5 h-5 text-primary-foreground -rotate-45" />
            </div>
            <span>bolt</span>
          </button>

          {/* Project Title */}
          <h1 className="text-white text-base font-semibold">Unspecified Project</h1>
        </div>

        {/* View Mode Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-white hover:bg-[#2a2a2a]">
            <Code className="w-4 h-4 mr-1" /> Code
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-[#2a2a2a]">
            <Eye className="w-4 h-4 mr-1" /> Preview
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-[#2a2a2a]">
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Publish and User */}
        <div className="flex items-center gap-3">
          <Button className="bg-primary hover:bg-primary/90 text-white">
            Publish
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-[#2a2a2a]">
            <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs">B</div>
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Chat */}
        {chatWidth > 0 && (
          <div
            className="bg-[#0C1111] border-r border-[#2a2a2a] flex flex-col"
            style={{ width: `${chatWidth}px` }}
          >
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-white">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500 text-sm">How can Bolt help you today? [or /command]</p>
                </div>
              ) : (
                <div>
                  <div className="bg-[#161B1B] p-4 rounded-lg shadow-md mb-4">
                    <h2 className="text-lg font-semibold mb-2">Unspecified Project</h2>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                      <li>Clean, responsive game board with smooth animations</li>
                      <li>Real-time player status display</li>
                      <li>Score tracking for X, O, and draws</li>
                      <li>Winning line highlighting with pulse animation</li>
                      <li>Beautiful gradient UI with glass-morphism design</li>
                      <li>Reset game and reset scores buttons</li>
                      <li>Mobile-friendly responsive layout</li>
                    </ul>
                    <h3 className="text-md font-semibold mt-4 mb-2">How it works:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                      <li>Players X and O take turns clicking squares</li>
                      <li>First to get three in a row (horizontal, vertical, or diagonal) wins</li>
                      <li>Scores update automatically</li>
                      <li>Play as many games as you want</li>
                    </ul>
                    <p className="text-sm mt-4 text-gray-300">
                      The app is production-ready and built with React + Vite. You can start playing immediately!
                    </p>
                    <div className="mt-4 p-3 bg-[#0C1111] rounded-md flex items-center justify-between">
                      <span className="text-sm font-medium">Create modern Tic Tac Toe game</span>
                      <span className="text-xs text-gray-500">Version 2</span>
                    </div>
                  </div>
                  {messages.map((message, index) => (
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
                  ))}
                </div>
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
              <PromptInputBox
                onSend={(message: string, files?: File[]) => {
                  if (message.trim()) {
                    setMessages((prev) => [...prev, { role: "user", content: message }]);
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
                  }
                }}
                isLoading={isThinking}
                placeholder="Build away..."
                className="bg-[#0C1111] border-[#2a2a2a]"
              />
            </div>
          </div>
        )}

        {/* Draggable divider */}
        <div
          className={`w-1 flex-shrink-0 select-none transition-all duration-150 ${
            isDragging ? 'bg-[#6a6a6a] w-2' : 'bg-[#2a2a2a] hover:bg-[#4a4a4a]'
          }`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{ cursor: isDragging ? 'col-resize' : 'col-resize' }}
        />

        {/* Right side - Preview */}
        <div className="flex-1 bg-[#050609] flex flex-col items-center justify-center">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-orange-500/20 via-pink-500/20 to-purple-600/20 flex items-center justify-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-500/30 to-pink-500/30 rounded-xl transform rotate-45"></div>
                </div>
              </div>
              <p className="text-gray-500 text-lg">Your preview will appear here</p>
            </div>
          </div>
          {/* Footer Links */}
          <div className="w-full flex justify-center gap-8 py-4 text-sm text-gray-500 border-t border-[#2a2a2a] bg-[#0C1111]">
            <a href="/help" className="hover:text-white">Help Center</a>
            <a href="/community" className="hover:text-white">Join our Community</a>
          </div>
        </div>
      </div>
    </div>
  );
}

