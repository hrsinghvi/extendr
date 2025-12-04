import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, ArrowLeft, RefreshCw, Edit2, Moon, HelpCircle, ArrowUpRight, Settings, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromptInputBox } from "@/components/ui/prompt-input-box";
import { AIMessage } from "@/components/AIMessage";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

// Preview system imports
import { 
  PreviewPanel, 
  useWebContainer,
  writeFile as wcWriteFile,
  readFile as wcReadFile,
  runCommand as wcRunCommand,
  type FileMap
} from "@/preview";
import {
  DEFAULT_MANIFEST
} from "@/extensions/chrome_mv3";

// AI Service imports
import {
  AIService,
  createToolContext,
  type ToolCall,
  type ToolResult,
  type Message as AIMessage_Type,
  type ToolContext
} from "@/lib/ai";
import { determineCategoryFromText } from "@/lib/categories";

// Types for chat and messages (from Supabase)
interface DBMessage {
  id: string;
  chat_id: string;
  user_id: string;
  content: string;
  role: "user" | "assistant";
  created_at: string;
  // New fields for tool tracking
  tool_calls?: string; // JSON string of tool calls
  tool_results?: string; // JSON string of tool results
  modified_files?: string[]; // Files modified during this message
}

interface Chat {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get default extension files
 */
function getDefaultExtensionFiles(): FileMap {
  return {
    'manifest.json': JSON.stringify(DEFAULT_MANIFEST, null, 2)
  };
}

export default function Build() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Project state
  const [project, setProject] = useState<Project | null>(null);
  const [projectTitle, setProjectTitle] = useState("New Project");
  
  // Chat state
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<DBMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  
  // Tool execution state
  const [currentToolCalls, setCurrentToolCalls] = useState<ToolCall[]>([]);
  const [thinkingMessage, setThinkingMessage] = useState("Thinking...");
  
  // Extension files state
  const [extensionFiles, setExtensionFiles] = useState<FileMap>(getDefaultExtensionFiles());
  
  // Ref to track files for tool context
  const extensionFilesRef = useRef<FileMap>(extensionFiles);
  useEffect(() => {
    extensionFilesRef.current = extensionFiles;
  }, [extensionFiles]);

  // WebContainer hook
  const {
    status,
    statusMessage,
    previewUrl,
    error: wcError,
    logs,
    build,
    stop,
    clearLogs,
    updateFiles,
    connectTerminal,
    isBooted
  } = useWebContainer({
    onPreviewUrl: (url) => {
      console.log('[Build] Preview URL received:', url);
      toast({
        title: 'Preview Ready',
        description: 'Your extension preview is now running.',
      });
    },
    onError: (error) => {
      console.error('[Build] WebContainer error:', error);
      toast({
        title: 'Build Error',
        description: error,
        variant: 'destructive'
      });
    }
  });

  // Terminal writer ref
  const terminalWriterRef = useRef<((data: string) => void) | null>(null);

  /**
   * Create tool context for AI service
   */
  const toolContext = useMemo((): ToolContext => {
    return createToolContext(
      {
        writeFile: async (path: string, content: string) => {
          try {
            await wcWriteFile(path, content);
          } catch (e) {
            // If WebContainer isn't ready, just update state
            console.log('[Build] WebContainer not ready, updating state only');
          }
        },
        readFile: async (path: string) => {
          try {
            return await wcReadFile(path);
          } catch (e) {
            // Fall back to state
            const files = extensionFilesRef.current;
            if (files[path]) return files[path];
            throw new Error(`File not found: ${path}`);
          }
        },
        runCommand: async (cmd: string, args: string[] = []) => {
          try {
            return await wcRunCommand(cmd, args);
          } catch (e) {
            return 1; // Error exit code
          }
        },
        build: async (files: FileMap, installDeps?: boolean) => {
          // Update state first
          setExtensionFiles(files);
          // Then trigger build
          await build(files, installDeps ?? true);
        },
        stop: () => stop(),
        isRunning: () => status === 'running',
        writeToTerminal: (data: string) => {
          if (terminalWriterRef.current) {
            terminalWriterRef.current(data);
          }
        },
        getLogs: () => logs.map(l => l.message),
        clearLogs: () => clearLogs()
      },
      {
        getFiles: () => extensionFilesRef.current,
        setFiles: (files: FileMap) => setExtensionFiles(files)
      }
    );
  }, [build, stop, status, logs, clearLogs]);

  /**
   * Create AI service instance
   */
  const aiService = useMemo(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY ?? "";
    const cleanKey = apiKey.replace(/^["'](.*)["']$/, "$1").trim();
    
    if (!cleanKey) {
      console.warn('[Build] No API key configured');
      return null;
    }
    
    // Detect provider type from key
    let providerType: 'gemini' | 'openai' | 'claude' = 'gemini';
    if (cleanKey.startsWith('sk-ant-')) {
      providerType = 'claude';
    } else if (cleanKey.startsWith('sk-')) {
      providerType = 'openai';
    }
    
    return new AIService({
      provider: {
        type: providerType,
        apiKey: cleanKey
      },
      onToolCall: (tc) => {
        console.log('[Build] Tool call:', tc.name);
        setCurrentToolCalls(prev => [...prev, tc]);
        setThinkingMessage(`Using ${tc.name.replace('ext_', '')}...`);
      },
      onToolResult: (tr) => {
        console.log('[Build] Tool result:', tr.name, tr.success);
      }
    });
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Handle terminal ready - connect it to WebContainer
   */
  const handleTerminalReady = useCallback((writer: (data: string) => void) => {
    console.log('[Build] Terminal ready, connecting to WebContainer');
    terminalWriterRef.current = writer;
    connectTerminal(writer);
  }, [connectTerminal]);

  /**
   * Loads a project by ID from Supabase
   */
  async function loadProjectById(projectId: string, userId: string): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .eq("user_id", userId)
        .single();
      
      if (error) {
        console.error("Error loading project:", error);
        return null;
      }
      return data as Project;
    } catch (err: any) {
      console.error("Error loading project:", err);
      return null;
    }
  }

  // Auth check and initial setup
  useEffect(() => {
    const initializeBuild = async () => {
      try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/");
        return;
      }
      
      setUser(session.user);
      const userId = session.user.id;
      
      const projectIdFromUrl = searchParams.get("project");
      
        // Case 1: Project ID in URL
      if (projectIdFromUrl) {
          console.log('[Build] Loading project from URL:', projectIdFromUrl);
        const existingProject = await loadProjectById(projectIdFromUrl, userId);
        if (existingProject) {
          setProject(existingProject);
          setProjectTitle(existingProject.title);
          await loadOrCreateChat(userId, existingProject.id);
          setIsLoading(false);
          return;
        }
      }
      
        // Case 2: Project passed via location state
      if (location.state?.project) {
          console.log('[Build] Loading project from state');
        const proj = location.state.project as Project;
        setProject(proj);
        setProjectTitle(proj.title);
        setSearchParams({ project: proj.id }, { replace: true });
        await loadOrCreateChat(userId, proj.id);
        setIsLoading(false);
        return;
      }

        // Case 3: Prompt passed via location state - create new project
        if (location.state?.prompt) {
          console.log('[Build] Creating new project from prompt');
        const generatedTitle = generateProjectTitle(location.state.prompt);
        const newProject = await createProject(userId, generatedTitle, location.state.prompt);
          
          if (!newProject) {
            console.error('[Build] Failed to create project');
            toast({
              title: "Error",
              description: "Failed to create project. Please try again.",
              variant: "destructive"
            });
            setIsLoading(false);
            return;
          }
          
          setProject(newProject);
          setProjectTitle(newProject.title);
          setSearchParams({ project: newProject.id }, { replace: true });
          
          const chat = await createChat(userId, newProject.id, "Initial Chat");
          if (!chat) {
            console.error('[Build] Failed to create chat');
            toast({
              title: "Error", 
              description: "Failed to create chat. Please try again.",
              variant: "destructive"
            });
            setIsLoading(false);
            return;
          }
          
            setCurrentChat(chat);
          setIsLoading(false); // Show UI before sending message
          
          // Send the initial message (this will set isThinking)
            await sendMessage(location.state.prompt, chat.id, userId);
        return;
      }
      
        // Case 4: No context - load most recent project or create new one
        console.log('[Build] Loading recent project or creating new one');
      const { data: recentProjects, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(1);
      
      if (!error && recentProjects && recentProjects.length > 0) {
        const recentProject = recentProjects[0] as Project;
        setProject(recentProject);
        setProjectTitle(recentProject.title);
        setSearchParams({ project: recentProject.id }, { replace: true });
        await loadOrCreateChat(userId, recentProject.id);
      } else {
        const newProject = await createProject(userId, "Untitled Project");
        if (newProject) {
          setProject(newProject);
          setProjectTitle(newProject.title);
          setSearchParams({ project: newProject.id }, { replace: true });
          await loadOrCreateChat(userId, newProject.id);
        }
      }
      
      setIsLoading(false);
      } catch (err: any) {
        console.error('[Build] Initialization error:', err);
        toast({
          title: "Error",
          description: err.message || "Failed to initialize. Please refresh.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    initializeBuild();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location, searchParams, setSearchParams]);

  /**
   * Generates a project title based on user's prompt
   */
  function generateProjectTitle(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    const patterns = [
      { regex: /tic\s*tac\s*toe|tictactoe/, title: "Tic Tac Toe" },
      { regex: /calculator|math|calculate/, title: "Calculator" },
      { regex: /todo|task\s*list|to\s*do/, title: "Todo List" },
      { regex: /weather|forecast|temperature/, title: "Weather App" },
      { regex: /clock|timer|alarm/, title: "Clock" },
      { regex: /notes|notebook|journal/, title: "Notes" },
      { regex: /tab|tabs/, title: "Tab Manager" },
      { regex: /bookmark/, title: "Bookmark Manager" },
      { regex: /screenshot/, title: "Screenshot Tool" },
      { regex: /dark\s*mode|theme/, title: "Theme Switcher" },
      { regex: /password|security/, title: "Password Tool" },
      { regex: /ad\s*block|blocker/, title: "Ad Blocker" },
      { regex: /extension|chrome|browser/, title: "Browser Extension" }
    ];
    
    for (const pattern of patterns) {
      if (pattern.regex.test(lowerPrompt)) {
        return pattern.title;
      }
    }
    
    const words = prompt.split(' ').filter(word => 
      word.length > 2 && 
      !['the', 'and', 'or', 'but', 'for', 'with', 'that', 'this', 'from', 'have'].includes(word.toLowerCase())
    );
    
    if (words.length >= 2) {
      const titleWords = words.slice(0, Math.min(3, words.length))
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
      return titleWords.join(' ');
    }
    
    const firstWord = prompt.trim().split(' ')[0];
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
  }

  /**
   * Creates a new project in Supabase
   */
  async function createProject(userId: string, title: string, description?: string): Promise<Project | null> {
    const category = determineCategoryFromText(title + " " + (description || ""));
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert({ user_id: userId, title, description, category })
        .select()
        .single();
      
      if (error) throw error;
      return data as Project;
    } catch (err: any) {
      console.error("Error creating project:", err);
      toast({
        title: "Error creating project",
        description: err.message,
        variant: "destructive",
      });
      return null;
    }
  }

  /**
   * Save project files to Supabase
   */
  async function saveProjectFiles(projectId: string, files: FileMap) {
    try {
      const { error } = await supabase
        .from('project_files')
        .upsert({ 
          project_id: projectId, 
          files: files as any, 
          updated_at: new Date().toISOString() 
        }, { onConflict: 'project_id' });

      if (error) throw error;
      console.log('[Build] Project files saved');
    } catch (err: any) {
      console.error('[Build] Error saving project files:', err);
    }
  }

  /**
   * Loads existing chat for a project or creates a new one
   */
  async function loadOrCreateChat(userId: string, projectId: string) {
    try {
      const { data: existingChats, error: fetchError } = await supabase
        .from("chats")
        .select("*")
        .eq("project_id", projectId)
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(1);
      
      if (fetchError) throw fetchError;
      
      if (existingChats && existingChats.length > 0) {
        const chat = existingChats[0] as Chat;
        setCurrentChat(chat);
        await loadMessages(chat.id);
      } else {
        const newChat = await createChat(userId, projectId, "Chat 1");
        if (newChat) {
          setCurrentChat(newChat);
          setMessages([]);
          setExtensionFiles(getDefaultExtensionFiles());
        }
      }
    } catch (err: any) {
      console.error("Error loading chat:", err);
      toast({
        title: "Error loading chat",
        description: err.message,
        variant: "destructive",
      });
    }
  }

  /**
   * Creates a new chat in Supabase
   */
  async function createChat(userId: string, projectId: string, title: string): Promise<Chat | null> {
    try {
      const { data, error } = await supabase
        .from("chats")
        .insert({ user_id: userId, project_id: projectId, title })
        .select()
        .single();
      
      if (error) throw error;
      return data as Chat;
    } catch (err: any) {
      console.error("Error creating chat:", err);
      toast({
        title: "Error creating chat",
        description: err.message,
        variant: "destructive",
      });
      return null;
    }
  }

  /**
   * Loads messages for a chat from Supabase
   */
  async function loadMessages(chatId: string) {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      
      setMessages((data as DBMessage[]) || []);
      
      // Load project files if they exist
      if (project) {
        const { data: fileData } = await supabase
          .from('project_files')
          .select('files')
          .eq('project_id', project.id)
          .single();
        
        if (fileData?.files) {
          console.log('[Build] Loaded project files from database');
          setExtensionFiles(fileData.files as FileMap);
        }
      }
    } catch (err: any) {
      console.error("Error loading messages:", err);
      toast({
        title: "Error loading messages",
        description: err.message,
        variant: "destructive",
      });
    }
  }

  /**
   * Sends a message and gets AI response using the tool-based AI service
   */
  async function sendMessage(content: string, chatId: string, userId: string) {
    if (!content.trim() || !chatId || !userId) return;
    
    if (!aiService) {
      toast({
        title: "API Key Required",
        description: "Please configure your AI API key in the .env file.",
        variant: "destructive"
      });
      return;
    }
    
    setIsThinking(true);
    setCurrentToolCalls([]);
    setThinkingMessage("Thinking...");
    
    try {
      // Save user message
      const { data: userMsg, error: userMsgError } = await supabase
        .from("messages")
        .insert({
          chat_id: chatId,
          user_id: userId,
          content: content.trim(),
          role: "user",
        })
        .select()
        .single();
      
      if (userMsgError) throw userMsgError;
      
      const newUserMessage = userMsg as DBMessage;
      setMessages((prev) => [...prev, newUserMessage]);
      
      // Update chat timestamp
      await supabase
        .from("chats")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", chatId);
      
      // Convert DB messages to AI message format for context
      const aiHistory: AIMessage_Type[] = messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }));
      
      // Call AI service with tool support
      const result = await aiService.chat(content.trim(), aiHistory, toolContext);
      
      console.log('[Build] AI result:', {
        toolCalls: result.toolCalls.length,
        modifiedFiles: result.modifiedFiles,
        buildTriggered: result.buildTriggered
      });
      
          // Save assistant message with tool info
      const { data: assistantMsg, error: assistantMsgError } = await supabase
        .from("messages")
        .insert({
          chat_id: chatId,
          user_id: userId,
          content: result.response,
          role: "assistant",
          tool_calls: result.toolCalls.length > 0 ? result.toolCalls : null,
          modified_files: result.modifiedFiles.length > 0 ? result.modifiedFiles : null
        })
        .select()
        .single();
      
      if (assistantMsgError) throw assistantMsgError;
      
      setMessages((prev) => [...prev, assistantMsg as DBMessage]);

      // Save files to project if any were modified
      if (result.modifiedFiles.length > 0 && project) {
        await saveProjectFiles(project.id, extensionFilesRef.current);
        
        toast({
          title: "Files Created",
          description: `Created ${result.modifiedFiles.length} file(s). ${result.buildTriggered ? 'Building preview...' : 'Click Build & Run to preview.'}`,
        });
      }
      
      // If build wasn't triggered by AI but files were modified, suggest building
      if (result.modifiedFiles.length > 0 && !result.buildTriggered) {
        // Auto-build after file creation
        setTimeout(() => {
          build(extensionFilesRef.current, true);
        }, 500);
      }
      
    } catch (err: any) {
      console.error("Error sending message:", err);
      toast({
        title: "Error sending message",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsThinking(false);
      setCurrentToolCalls([]);
      setThinkingMessage("Thinking...");
    }
  }

  /**
   * Handle sending a message from the input box
   */
  function handleSendMessage(message: string, files?: File[]) {
    if (!message.trim() || !currentChat || !user) return;
    sendMessage(message, currentChat.id, user.id);
  }

  /**
   * Handle file changes from the editor
   */
  const handleFilesChange = useCallback((newFiles: FileMap) => {
    setExtensionFiles(newFiles);
    
    // Save to project
    if (project) {
      saveProjectFiles(project.id, newFiles);
    }
  }, [project]);

  /**
   * Handle build button click
   */
  const handleBuild = useCallback(() => {
    console.log('[Build] handleBuild called with', Object.keys(extensionFiles).length, 'files');
    build(extensionFiles, true);
  }, [build, extensionFiles]);

  /**
   * Handle stop button click
   */
  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  /**
   * Handle rebuild
   */
  const handleRebuild = useCallback(() => {
    build(extensionFiles, false);
  }, [build, extensionFiles]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#1a1a1a] flex flex-col overflow-hidden">
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden bg-[#232323]">
        {/* Left sidebar - Chat */}
        <div className="bg-[#232323] flex flex-col w-[400px] min-w-[350px] max-w-[500px] border-r border-gray-800">
          {/* Chat Top Bar */}
          <div className="h-12 flex items-center px-4 border-b border-gray-800">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:bg-white/5 p-1.5 rounded-lg transition-colors text-left focus:outline-none">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{projectTitle}</span>
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
                  Extendr
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
                    <div className="h-full bg-[#5A9665] w-[60%]"></div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-2 h-2 rounded-full bg-[#5A9665]"></div>
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
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-r from-[#5A9665] to-[#5f87a3] flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Build Your Extension</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Describe the Chrome extension you want to create and I'll help you build it.
                </p>
                <div className="space-y-2 text-left w-full max-w-xs">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Try asking:</p>
                  <button 
                    onClick={() => handleSendMessage("Create a simple tab counter extension that shows how many tabs are open")}
                    className="w-full text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 p-2 rounded-lg transition-colors"
                  >
                    "Create a tab counter extension"
                  </button>
                  <button 
                    onClick={() => handleSendMessage("Build a dark mode toggle extension for any website")}
                    className="w-full text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 p-2 rounded-lg transition-colors"
                  >
                    "Build a dark mode toggle extension"
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-lg px-4 py-3 ${
                        message.role === "user"
                        ? "bg-[#5A9665] text-white"
                        : "bg-[#2a2a2a] text-white"
                        }`}
                    >
                      {message.role === 'assistant' ? (
                        <AIMessage 
                          content={message.content}
                          modifiedFiles={message.modified_files}
                          toolCalls={message.tool_calls ? (typeof message.tool_calls === 'string' ? JSON.parse(message.tool_calls) : message.tool_calls) : undefined}
                        />
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
            {isThinking && (
              <div className="flex items-start gap-3 text-gray-400">
                <div className="bg-[#2a2a2a] rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#5A9665] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#5A9665] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-[#5A9665] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
                    <span className="text-sm">{thinkingMessage}</span>
                  </div>
                  {currentToolCalls.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      {currentToolCalls.map((tc, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className="text-green-400">✓</span>
                          <span>{tc.name.replace('ext_', '')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Chat input */}
          <div className="p-4 border-t border-gray-800">
            <PromptInputBox
              onSend={handleSendMessage}
              isLoading={isThinking}
              placeholder="Describe your extension idea..."
              className="bg-[#1a1a1a] border-[#3C4141] rounded-lg"
            />
          </div>
        </div>

        {/* Right side - Preview Panel */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Preview Panel */}
          <PreviewPanel
            files={extensionFiles}
            onFilesChange={handleFilesChange}
            status={status}
            statusMessage={statusMessage}
            previewUrl={previewUrl}
            error={wcError}
            logs={logs}
            onBuild={handleBuild}
            onRun={handleRebuild}
            onStop={handleStop}
            onClearLogs={clearLogs}
            onTerminalReady={handleTerminalReady}
            className="flex-1"
            userEmail={user?.email}
            onExport={() => {
              toast({
                title: "Export Coming Soon",
                description: "Extension export will be available soon.",
              });
            }}
            onPublish={() => {
              toast({
                title: "Publish Coming Soon",
                description: "Extension publishing will be available soon.",
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
