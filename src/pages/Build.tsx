import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Send, Paperclip, MoreVertical, Code, Eye, Settings, Github, Plus, ChevronDown, ArrowLeft, RefreshCw, Edit2, Moon, HelpCircle, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromptInputBox } from "@/components/ui/prompt-input-box";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

export default function Build() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [isThinking, setIsThinking] = useState(false);


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
      <div className="h-12 bg-[#0C1111] border-b border-white/20 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 hover:bg-white/5 p-2 rounded-lg transition-colors text-left focus:outline-none">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Send className="w-6 h-6 text-white -rotate-45" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">Bolt AI Landing</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </div>
                  <span className="text-xs text-gray-400">Previewing last saved version</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={8} className="w-64 bg-[#0C1111] border-[#2a2a2a] text-white p-2">
              <DropdownMenuItem onClick={() => navigate('/')} className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to Dashboard
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-[#2a2a2a] my-2" />

              <div className="px-2 py-1.5 text-sm font-semibold text-gray-400">
                The's Lovable
              </div>

              <div className="mx-2 p-3 bg-[#161B1B] border border-[#2a2a2a] rounded-lg mb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Credits</span>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <span>5 left</span>
                    <ChevronDown className="w-3 h-3" />
                  </div>
                </div>
                <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-blue-600 w-[60%]"></div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  Daily credits used first
                </div>
              </div>

              <DropdownMenuItem className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-white">
                <Settings className="w-4 h-4 mr-2" />
                Settings
                <span className="ml-auto text-xs text-gray-500">⌘.</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-white">
                <RefreshCw className="w-4 h-4 mr-2" />
                Remix this project
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-white">
                <Edit2 className="w-4 h-4 mr-2" />
                Rename project
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-[#2a2a2a] my-2" />

              <DropdownMenuItem className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-white">
                <Moon className="w-4 h-4 mr-2" />
                Appearance
                <ChevronDown className="w-3 h-3 ml-auto text-gray-500" />
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-white">
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
                <ArrowUpRight className="w-3 h-3 ml-auto text-gray-500" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
      <div className="flex-1 flex overflow-hidden bg-[#0C1111]">
        {/* Left sidebar - Chat */}
        <div
          className="bg-[#0C1111] flex flex-col w-1/3 min-w-[300px]"
        >
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-white custom-scrollbar">
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
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === "user"
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
          <div className="p-4">
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
              className="bg-[#0C1111] border-[#3C4141] rounded-lg"
            />
          </div>
        </div>



        {/* Right side - Preview */}
        <div className="flex-1 bg-[#0C1111] flex flex-col items-center justify-center rounded-lg shadow-2xl border border-white/20 overflow-hidden my-4 mr-4">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 text-lg">Your preview will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

