import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, Paperclip, MoreVertical, Code, Eye, Settings, Github, Plus, ChevronDown, ArrowLeft, RefreshCw, Edit2, Moon, HelpCircle, ArrowUpRight, Database, Play, FileCode, ScanEye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromptInputBox } from "@/components/ui/prompt-input-box";
import { Project } from "@/types/database";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";

export default function Build() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [projectTitle, setProjectTitle] = useState("New Project");
  const [projectImage, setProjectImage] = useState<string | null>(null);
  const [projectFeatures, setProjectFeatures] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    // If not authenticated, redirect to home
    if (!isAuthenticated || !user) {
      navigate("/");
      return;
    }

    // Only initialize once
    if (initialized) return;
    setInitialized(true);

    const initializeProject = async () => {
      // Load existing project or create new one
      if (location.state?.projectId) {
        await loadProject(location.state.projectId);
      } else if (location.state?.prompt) {
        await createNewProject(location.state.prompt);
      }

      setIsLoading(false);
    };

    initializeProject();
  }, [authLoading, isAuthenticated, user, navigate, location, initialized]);

  const loadProject = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return;

      const project = data as unknown as Project;
      setProjectId(project.id);
      setProjectTitle(project.title);
      setProjectImage(project.image);
      setProjectFeatures(project.features || []);
      setMessages(project.messages || []);
    } catch (error) {
      console.error('Error loading project:', error);
      toast({
        title: "Error",
        description: "Failed to load project",
        variant: "destructive",
      });
    }
  };

  const createNewProject = async (initialPrompt: string) => {
    try {
      if (!user) return;

      const projectData = {
        user_id: user.id,
        title: "New Project",
        type: "Website",
        messages: [{ role: "user" as const, content: initialPrompt }],
      };

      const { data, error } = await supabase
        .from('projects')
        .insert([projectData] as any)
        .select()
        .single();

      if (error) throw error;
      if (!data) return;

      const project = data as unknown as Project;
      setProjectId(project.id);
      setProjectTitle(project.title);
      setMessages([{ role: "user", content: initialPrompt }]);
      setIsThinking(true);

      setTimeout(() => {
        setIsThinking(false);
        const newMessages: Array<{ role: "user" | "assistant"; content: string }> = [
          { role: "user", content: initialPrompt },
          {
            role: "assistant",
            content: "I'm ready to help you build your app! Let me start by understanding your requirements...",
          },
        ];
        setMessages(newMessages);
        saveProject({ messages: newMessages });
      }, 2000);
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    }
  };

  const saveProject = async (updates: Partial<Project>) => {
    if (!projectId) return;

    try {
      const { error } = await (supabase
        .from('projects') as any)
        .update(updates)
        .eq('id', projectId);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    }
  };

  const handlePublish = async () => {
    if (!projectId) return;

    try {
      const { error } = await (supabase
        .from('projects') as any)
        .update({ is_published: true })
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project published successfully!",
      });
    } catch (error) {
      console.error('Error publishing project:', error);
      toast({
        title: "Error",
        description: "Failed to publish project",
        variant: "destructive",
      });
    }
  };




  if (authLoading || isLoading) {
    return (
      <div className="h-screen w-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#1a1a1a] flex flex-col overflow-hidden">
      {/* Top bar */}


      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden bg-[#232323]">
        {/* Left sidebar - Chat */}
        <div
          className="bg-[#232323] flex flex-col w-1/3 min-w-[300px]"
        >
          {/* Chat Top Bar */}
          <div className="h-12 flex items-center px-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:bg-white/5 p-1.5 rounded-lg transition-colors text-left focus:outline-none">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-xs">{projectTitle}</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={8} className="w-64 bg-[#1F2020] border-[#2a2a2a] text-white p-2">
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
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-white custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500 text-sm">How can Bolt help you today? [or /command]</p>
              </div>
            ) : (
              <div>
                {projectFeatures.length > 0 && (
                  <div className="bg-[#161B1B] p-4 rounded-lg shadow-md mb-4">
                    <h2 className="text-lg font-semibold mb-2">{projectTitle}</h2>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                      {projectFeatures.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
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
                  const newMessages: Array<{ role: "user" | "assistant"; content: string }> = [
                    ...messages, 
                    { role: "user", content: message }
                  ];
                  setMessages(newMessages);
                  setIsThinking(true);

                  // Save message to database
                  saveProject({ messages: newMessages });

                  // Simulate AI response
                  setTimeout(() => {
                    setIsThinking(false);
                    const updatedMessages: Array<{ role: "user" | "assistant"; content: string }> = [
                      ...newMessages,
                      {
                        role: "assistant",
                        content: "I understand. Let me help you with that...",
                      },
                    ];
                    setMessages(updatedMessages);
                    saveProject({ messages: updatedMessages });
                  }, 2000);
                }
              }}
              isLoading={isThinking}
              placeholder="Build away..."
              className="bg-[#232323] border-[#3C4141] rounded-lg"
            />
          </div>
        </div>



        {/* Right side - Preview */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#232323]">
          {/* Preview Top Bar - Aligned with Chat Top Bar */}
          <div className="h-12 flex items-center justify-between px-4 bg-[#232323]">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#161b1b] border border-[#2a2a2a] rounded-lg p-1">
              <div className="flex items-center relative gap-1">
                <button
                  onClick={() => setViewMode('preview')}
                  className={`relative z-10 py-1 px-2 rounded-md transition-colors duration-200 ${viewMode === 'preview' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                    }`}
                >
                  {viewMode === 'preview' && (
                    <motion.div
                      layoutId="viewMode-indicator"
                      className="absolute inset-0 bg-white/10 rounded-md shadow-sm"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <ScanEye className="w-4 h-4 relative z-10" />
                </button>

                <button
                  onClick={() => setViewMode('code')}
                  className={`relative z-10 py-1 px-2 rounded-md transition-colors duration-200 ${viewMode === 'code' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                    }`}
                >
                  {viewMode === 'code' && (
                    <motion.div
                      layoutId="viewMode-indicator"
                      className="absolute inset-0 bg-white/10 rounded-md shadow-sm"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <FileCode className="w-4 h-4 relative z-10" />
                </button>
              </div>
            </div>

            {/* Publish and User */}
            <div className="flex items-center gap-2">
              <Button 
                onClick={handlePublish}
                className="h-8 text-xs bg-primary hover:bg-primary/90 text-white px-3"
              >
                Publish
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-[#2a2a2a]">
                <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs">B</div>
              </Button>
            </div>
          </div>

          {/* Preview Content Card */}
          <div className="flex-1 pr-4 pb-4 pl-4">
            <div className="w-full h-full bg-[#0C1111] rounded-lg shadow-2xl border border-white/20 overflow-hidden flex flex-col">
              <div className="flex-1 flex items-center justify-center w-full h-full bg-[#1a1a1a]">
                {projectImage ? (
                  <img
                    src={projectImage}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <p className="text-gray-500 text-lg">Your preview will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

