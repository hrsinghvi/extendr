import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, ArrowLeft, Edit2, HelpCircle, ArrowUpRight, Settings, Download, Eye, Trash2, Play, Terminal, Package, Pencil } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useSubscriptionContext } from "@/context/SubscriptionContext";
import { OutOfCreditsModal } from "@/components/OutOfCreditsModal";
import { CreditDisplay } from "@/components/CreditDisplay";

// Preview system imports
import { 
  PreviewPanel, 
  useWebContainer,
  BuildStatus,
  writeFile as wcWriteFile,
  readFile as wcReadFile,
  runCommand as wcRunCommand,
  type FileMap
} from "@/preview";
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
import { buildAndDownloadExtension, downloadSourceFiles } from "@/lib/export";

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
 * Returns empty to let the AI create everything from scratch
 */
function getDefaultExtensionFiles(): FileMap {
  return {};
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
  
  // Credits modal state
  const [showOutOfCreditsModal, setShowOutOfCreditsModal] = useState(false);
  
  // Rename modal state
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  
  // Subscription/credits context
  const { useCredit, hasCredits, isUsingCredit } = useSubscriptionContext();
  
  // Ref to track files for tool context
  const extensionFilesRef = useRef<FileMap>(extensionFiles);
  const projectRef = useRef<Project | null>(null); // Ref to current project for async operations
  const isSavingRef = useRef(false); // Prevent concurrent saves
  const pendingSaveRef = useRef<FileMap | null>(null); // Queue pending save
  const hasAutoBuiltRef = useRef(false); // Track if we've auto-built for current project
  const lastProjectIdRef = useRef<string | null>(null); // Track project ID for auto-build reset
  
  useEffect(() => {
    extensionFilesRef.current = extensionFiles;
  }, [extensionFiles]);

  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  // ============================================================================
  // PERSISTENCE SYSTEM - Supabase File Storage
  // ============================================================================

  /**
   * Save files to Supabase - SYNCHRONOUS, throws on error
   * This is the single source of truth for file persistence
   */
  const saveFilesToSupabase = useCallback(async (projectId: string, files: FileMap): Promise<boolean> => {
    if (Object.keys(files).length === 0) {
      console.log('[Persistence] No files to save');
      return true;
    }

    console.log('[Persistence] Saving', Object.keys(files).length, 'files to Supabase...');
    
    try {
      const { error } = await supabase
        .from('project_files')
        .upsert({ 
          project_id: projectId, 
          files: files as any, 
          updated_at: new Date().toISOString() 
        }, { onConflict: 'project_id' });

      if (error) {
        console.error('[Persistence] Save failed:', error);
        toast({
          title: "Save Failed",
          description: `Could not save files: ${error.message}`,
          variant: "destructive"
        });
        return false;
      }
      
      console.log('[Persistence] ✓ Files saved successfully');
      return true;
    } catch (err: any) {
      console.error('[Persistence] Save error:', err);
      toast({
        title: "Save Error",
        description: err.message,
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  /**
   * Load files from Supabase for a project
   */
  const loadFilesFromSupabase = useCallback(async (projectId: string): Promise<FileMap> => {
    console.log('[Persistence] Loading files from Supabase for project:', projectId);
    
    try {
      const { data, error } = await supabase
        .from('project_files')
        .select('files')
        .eq('project_id', projectId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No files found - this is OK for new projects
          console.log('[Persistence] No saved files found (new project)');
          return {};
        }
        console.error('[Persistence] Load error:', error);
        return {};
      }
      
      if (data?.files && typeof data.files === 'object') {
        const files = data.files as FileMap;
        console.log('[Persistence] ✓ Loaded', Object.keys(files).length, 'files from Supabase');
        return files;
      }
      
      return {};
    } catch (err: any) {
      console.error('[Persistence] Load exception:', err);
      return {};
    }
  }, []);

  /**
   * Queue a save operation (debounced to prevent too many saves)
   */
  const queueSave = useCallback(async (files: FileMap) => {
    const proj = projectRef.current;
    if (!proj) {
      console.log('[Persistence] No project, skipping save');
      return;
    }

    // If already saving, queue this save
    if (isSavingRef.current) {
      console.log('[Persistence] Save in progress, queuing...');
      pendingSaveRef.current = files;
      return;
    }

    isSavingRef.current = true;
    await saveFilesToSupabase(proj.id, files);
    isSavingRef.current = false;

    // Process queued save if any
    if (pendingSaveRef.current) {
      const queuedFiles = pendingSaveRef.current;
      pendingSaveRef.current = null;
      await queueSave(queuedFiles);
    }
  }, [saveFilesToSupabase]);

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
    },
    onError: (error) => {
      console.error('[Build] WebContainer error:', error);
      
      // Handle WebContainer singleton error gracefully
      if (error.includes('single WebContainer') || error.includes('already running')) {
        console.warn('[Build] WebContainer already running - this can happen during dev hot reload');
        // Don't show toast for this - it's expected during development
        // Just try to refresh the page after a short delay
        toast({
          title: 'Refreshing...',
          description: 'WebContainer needs to restart. Refreshing page...',
        });
        setTimeout(() => window.location.reload(), 1500);
        return;
      }
      
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
   * This context connects the AI tools to WebContainer and saves files to Supabase
   * 
   * CRITICAL: Supabase save happens FIRST, before WebContainer operations
   * This guarantees files are persisted even if WebContainer crashes
   */
  const toolContext = useMemo((): ToolContext => {
    return createToolContext(
      {
        // writeFile: Save to Supabase FIRST, then write to WebContainer
        writeFile: async (path: string, content: string) => {
          // 1. Update state FIRST
          const newFiles = { ...extensionFilesRef.current, [path]: content };
          extensionFilesRef.current = newFiles;
          setExtensionFiles(newFiles);
          
          // 2. Save to Supabase BEFORE WebContainer (guaranteed persistence)
          const proj = projectRef.current;
          if (proj) {
            console.log('[ToolContext] Saving to Supabase FIRST:', path);
            await saveFilesToSupabase(proj.id, newFiles);
          }
          
          // 3. THEN write to WebContainer (preview) - errors here won't lose data
          try {
            await wcWriteFile(path, content);
            console.log('[ToolContext] Wrote to WebContainer:', path);
          } catch (e) {
            console.log('[ToolContext] WebContainer error (file already saved to Supabase):', path);
            // Don't throw - file is already safely saved
          }
        },
        readFile: async (path: string) => {
          // First try state (includes Supabase-loaded files)
          const files = extensionFilesRef.current;
          if (files[path]) return files[path];
          
          // Fall back to WebContainer
          try {
            return await wcReadFile(path);
          } catch (e) {
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
          // Update state FIRST
          extensionFilesRef.current = files;
          setExtensionFiles(files);
          
          // Save to Supabase BEFORE building
          const proj = projectRef.current;
          if (proj) {
            await saveFilesToSupabase(proj.id, files);
          }
          
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
        // setFiles: Updates state AND saves to Supabase
        setFiles: (files: FileMap) => {
          console.log('[ToolContext] setFiles called with', Object.keys(files).length, 'files');
          extensionFilesRef.current = files;
          setExtensionFiles(files);
          // Save to Supabase
          queueSave(files);
        }
      }
    );
  }, [build, stop, status, logs, clearLogs, queueSave, saveFilesToSupabase]);

  /**
   * Create AI service instance
   * Priority: OpenRouter > Gemini > OpenAI > Claude
   */
  const aiService = useMemo(() => {
    // Clean and extract API keys - handle various formats (quotes, whitespace, undefined)
    const cleanKey = (key: string | undefined): string => {
      if (!key) return "";
      return key.replace(/^["'](.*)["']$/, "$1").trim();
    };
    
    const openrouterKey = cleanKey(import.meta.env.VITE_OPENROUTER_API_KEY);
    const geminiKey = cleanKey(import.meta.env.VITE_GEMINI_API_KEY);
    const openaiKey = cleanKey(import.meta.env.VITE_OPENAI_API_KEY);
    const claudeKey = cleanKey(import.meta.env.VITE_CLAUDE_API_KEY);
    
    // Debug logging - shows which keys are available (masked for security)
    console.log('[Build] API Keys available:', {
      openrouter: openrouterKey ? `${openrouterKey.substring(0, 10)}...` : 'NOT SET',
      gemini: geminiKey ? `${geminiKey.substring(0, 10)}...` : 'NOT SET',
      openai: openaiKey ? `${openaiKey.substring(0, 10)}...` : 'NOT SET',
      claude: claudeKey ? `${claudeKey.substring(0, 10)}...` : 'NOT SET'
    });
    
    let apiKey = "";
    let providerType: 'gemini' | 'openai' | 'claude' | 'openrouter' = 'gemini';
    
    // Priority: OpenRouter > Gemini > OpenAI > Claude
    // OpenRouter takes ABSOLUTE priority if available
    if (openrouterKey && openrouterKey.length > 10) {
      apiKey = openrouterKey;
      providerType = 'openrouter';
      console.log('[Build] ✓ Using OpenRouter API (priority 1)');
    } else if (geminiKey && geminiKey.length > 10) {
      apiKey = geminiKey;
      providerType = 'gemini';
      console.log('[Build] Using Gemini API (priority 2 - OpenRouter not available)');
    } else if (openaiKey && openaiKey.length > 10) {
      apiKey = openaiKey;
      providerType = 'openai';
      console.log('[Build] Using OpenAI API (priority 3)');
    } else if (claudeKey && claudeKey.length > 10) {
      apiKey = claudeKey;
      providerType = 'claude';
      console.log('[Build] Using Claude API (priority 4)');
    }
    
    if (!apiKey) {
      console.error('[Build] ❌ No valid API key configured! Check your environment variables.');
      return null;
    }
    
    console.log(`[Build] Final provider: ${providerType.toUpperCase()}`);
    
    return new AIService({
      provider: {
        type: providerType,
        apiKey: apiKey
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
   * Auto-build when loading a project with existing files
   * This ensures the preview starts automatically when returning to a project
   */
  useEffect(() => {
    // Reset auto-build tracking when project changes
    if (project?.id && project.id !== lastProjectIdRef.current) {
      hasAutoBuiltRef.current = false;
      lastProjectIdRef.current = project.id;
    }

    // Check conditions for auto-build:
    // 1. We have files loaded
    // 2. We haven't auto-built yet for this project
    // 3. We're not currently loading
    // 4. No preview URL yet
    // 5. Build status is idle (not already building)
    const hasFiles = Object.keys(extensionFiles).length > 0;
    const shouldAutoBuild = hasFiles && 
                           !hasAutoBuiltRef.current && 
                           !isLoading && 
                           !previewUrl && 
                           status === BuildStatus.IDLE &&
                           !isThinking;

    if (shouldAutoBuild) {
      console.log('[Auto-Build] Triggering auto-build for', Object.keys(extensionFiles).length, 'files');
      hasAutoBuiltRef.current = true;
      
      // Small delay to ensure everything is initialized
      const timer = setTimeout(() => {
        build(extensionFiles, true).catch(err => {
          console.warn('[Auto-Build] Failed:', err);
          // Reset flag so it can retry on next opportunity
          hasAutoBuiltRef.current = false;
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [extensionFiles, project?.id, isLoading, previewUrl, status, isThinking, build]);

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
   * Restore files to WebContainer from loaded state
   * This writes each file from the loaded Supabase data into the WebContainer
   */
  const restoreFilesToWebContainer = useCallback(async (files: FileMap): Promise<void> => {
    if (Object.keys(files).length === 0) {
      console.log('[Persistence] No files to restore to WebContainer');
      return;
    }

    console.log('[Persistence] Restoring', Object.keys(files).length, 'files to WebContainer...');
    
    for (const [path, content] of Object.entries(files)) {
      try {
        await wcWriteFile(path, content);
        console.log('[Persistence] ✓ Restored:', path);
      } catch (e) {
        console.warn('[Persistence] Could not restore to WC:', path, e);
        // Continue with other files even if one fails
      }
    }
    
    console.log('[Persistence] ✓ All files restored to WebContainer');
  }, []);

  /**
   * Loads existing chat for a project or creates a new one
   * Also loads and restores project files from Supabase
   */
  async function loadOrCreateChat(userId: string, projectId: string) {
    try {
      // Step 1: Load project files from Supabase FIRST
      console.log('[loadOrCreateChat] Loading project files...');
      await initializeProjectFiles(projectId);
      
      // Step 2: Load or create chat
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
   * MAIN INITIALIZATION: Load project files from Supabase and restore to WebContainer
   * This should be called BEFORE any preview is started
   */
  async function initializeProjectFiles(projectId: string): Promise<FileMap> {
    console.log('[Init] === LOADING PROJECT FILES ===');
    
    // Step 1: Load files from Supabase
    const files = await loadFilesFromSupabase(projectId);
    
    // Step 2: Update React state
    setExtensionFiles(files);
    extensionFilesRef.current = files;
    
    // Step 3: If we have files, restore them to WebContainer
    if (Object.keys(files).length > 0) {
      console.log('[Init] Restoring files to WebContainer...');
      await restoreFilesToWebContainer(files);
      // Auto-build will be triggered by the useEffect below
    }
    
    console.log('[Init] === PROJECT FILES READY ===');
    return files;
  }

  /**
   * Sends a message and gets AI response using the tool-based AI service
   * Checks credits before sending - 1 message = 1 credit
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
    
    // FAST PATH: Check hasCredits immediately (already loaded in context)
    // This shows the modal instantly without waiting for network call
    if (!hasCredits) {
      setShowOutOfCreditsModal(true);
      return;
    }
    
    // Use credit (deduct from balance) - only called if we have credits
    try {
      const creditResult = await useCredit();
      
      // Double-check the result (edge case: race condition where credits depleted)
      if (!creditResult.allowed) {
        setShowOutOfCreditsModal(true);
        return;
      }
      
      console.log('[Build] Credit used:', creditResult.message, 
        `Daily: ${creditResult.dailyRemaining}, Monthly: ${creditResult.monthlyRemaining}`);
    } catch (creditError) {
      console.error('[Build] Credit check error:', creditError);
      toast({
        title: "Credit Check Failed",
        description: "Unable to verify credits. Please try again.",
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

      // ALWAYS save files after AI response
      if (project && Object.keys(extensionFilesRef.current).length > 0) {
        console.log('[Build] Final save after AI response...');
        const saved = await saveFilesToSupabase(project.id, extensionFilesRef.current);
        if (saved) {
          console.log('[Build] ✓ All files persisted to Supabase');
        }
      }
      
      // If build wasn't triggered by AI but files were modified, auto-build
      if (result.modifiedFiles.length > 0 && !result.buildTriggered) {
        // Wait for all async operations to complete, then build
        // Using a longer delay and ensuring files are ready
        console.log('[Build] Auto-building after AI created files...');
        setTimeout(async () => {
          // Double-check we have files
          const currentFiles = extensionFilesRef.current;
          if (Object.keys(currentFiles).length > 0) {
            console.log('[Build] Starting auto-build with', Object.keys(currentFiles).length, 'files');
            await build(currentFiles, true);
          }
        }, 1500); // Increased from 500ms to give time for all async ops
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
   * Saves to Supabase immediately
   */
  const handleFilesChange = useCallback((newFiles: FileMap) => {
    // Update state and ref
    extensionFilesRef.current = newFiles;
    setExtensionFiles(newFiles);
    
    // Save to Supabase
    queueSave(newFiles);
  }, [queueSave]);

  /**
   * Handle build button click
   * Saves files to Supabase before building
   */
  const handleBuild = useCallback(async () => {
    console.log('[Build] handleBuild called with', Object.keys(extensionFiles).length, 'files');
    
    // Save to Supabase first
    if (project) {
      await saveFilesToSupabase(project.id, extensionFiles);
    }
    
    // Then build
    build(extensionFiles, true);
  }, [build, extensionFiles, project, saveFilesToSupabase]);

  /**
   * Handle stop button click
   */
  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  /**
   * Handle project rename
   * Updates Supabase and local state
   */
  const handleRenameProject = useCallback(async () => {
    if (!renameValue.trim() || !project) return;

    try {
      const { error } = await supabase
        .from("projects")
        .update({ title: renameValue.trim(), updated_at: new Date().toISOString() })
        .eq("id", project.id);

      if (error) throw error;

      // Update local state
      setProjectTitle(renameValue.trim());
      setProject(prev => prev ? { ...prev, title: renameValue.trim() } : null);
      
      setShowRenameModal(false);
      setRenameValue("");
      
      toast({
        title: "Project renamed",
        description: `Project is now called "${renameValue.trim()}"`,
      });
    } catch (err: any) {
      console.error("Error renaming project:", err);
      toast({
        title: "Error renaming project",
        description: err.message,
        variant: "destructive",
      });
    }
  }, [renameValue, project, toast]);

  /**
   * Handle rebuild
   * Saves files to Supabase before rebuilding
   */
  const handleRebuild = useCallback(async () => {
    // Save to Supabase first
    if (project) {
      await saveFilesToSupabase(project.id, extensionFiles);
    }
    
    build(extensionFiles, false);
  }, [build, extensionFiles, project, saveFilesToSupabase]);

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
        <div className="bg-[#232323] flex flex-col w-[480px] min-w-[420px] max-w-[600px] border-r border-gray-800">
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
                  <CreditDisplay showLabels={true} />
                </div>

                <DropdownMenuItem className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-white">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                  <span className="ml-auto text-xs text-gray-500">⌘.</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-white"
                  onClick={() => setShowRenameModal(true)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Rename project
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-[#2a2a2a] my-2" />

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
                      className={`max-w-[90%] rounded-lg px-4 py-3 overflow-hidden ${
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
                <div className="bg-[#2a2a2a] rounded-lg px-4 py-3 max-w-[90%]">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[#5A9665] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[#5A9665] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 bg-[#5A9665] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                    <span className="text-sm">{thinkingMessage}</span>
                  </div>
                  {currentToolCalls.length > 0 && (
                    <div className="mt-3 bg-[#1a1a1a] rounded-lg overflow-hidden border border-gray-800">
                      <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-800 font-medium">
                        {currentToolCalls.length} action{currentToolCalls.length !== 1 ? 's' : ''} in progress...
                      </div>
                      <div className="px-3 py-2 space-y-1.5">
                        {currentToolCalls.map((tc, i) => {
                          const toolName = tc.name;
                          const args = tc.arguments as Record<string, unknown>;
                          const filePath = args.file_path as string;
                          const packageName = args.package as string;
                          const command = args.command as string;
                          
                          // Determine icon component, label, detail based on tool
                          let IconComponent = Terminal;
                          let label = toolName.replace('ext_', '').replace(/_/g, ' ');
                          let color = 'text-gray-400';
                          let detail = filePath || packageName || command;
                          
                          if (toolName === 'ext_write_file') {
                            IconComponent = Pencil;
                            label = 'Wrote';
                            color = 'text-green-400';
                          } else if (toolName === 'ext_read_file') {
                            IconComponent = Eye;
                            label = 'Read';
                            color = 'text-blue-400';
                          } else if (toolName === 'ext_replace_lines') {
                            IconComponent = Pencil;
                            label = 'Edited';
                            color = 'text-orange-400';
                          } else if (toolName === 'ext_build_preview') {
                            IconComponent = Play;
                            label = 'Building project';
                            color = 'text-[#5A9665]';
                            detail = '';
                          } else if (toolName === 'ext_delete_file') {
                            IconComponent = Trash2;
                            label = 'Deleted';
                            color = 'text-red-400';
                          } else if (toolName === 'ext_add_dependency') {
                            IconComponent = Package;
                            label = 'Installing';
                            color = 'text-cyan-400';
                          } else if (toolName === 'ext_download_file') {
                            IconComponent = Download;
                            label = 'Downloaded';
                            color = 'text-cyan-400';
                          } else if (toolName === 'ext_run_command') {
                            IconComponent = Terminal;
                            label = 'Ran command';
                            color = 'text-yellow-400';
                          }
                          
                          return (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <IconComponent className={`w-3.5 h-3.5 flex-shrink-0 ${color}`} />
                              <span className={`${color} flex-shrink-0`}>{label}</span>
                              {detail && (
                                <code className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-400 font-mono text-[10px] truncate">
                                  {detail}
                                </code>
                              )}
                            </div>
                          );
                        })}
                      </div>
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
            isAIWorking={isThinking}
            onExport={async () => {
              // Check if we have files to export
              if (Object.keys(extensionFiles).length === 0) {
                toast({
                  title: "No Files",
                  description: "No extension files to export. Create some files first!",
                  variant: "destructive",
                });
                return;
              }

              // If WebContainer is booted and running, use the full build export
              // Otherwise, export source files directly (faster, always works)
              const canBuild = isBooted && (status === BuildStatus.RUNNING || previewUrl);
              
              if (canBuild) {
                // Full build export - compiles the extension
                const buildingToast = toast({
                  title: "Building Extension...",
                  description: "Compiling your extension for Chrome. This may take a moment.",
                });
                
                try {
                  await buildAndDownloadExtension(
                    extensionFiles, 
                    projectTitle,
                    (progress) => {
                      console.log('[Export Progress]', progress);
                    }
                  );
                  
                  buildingToast.dismiss?.();
                  toast({
                    title: "Exported!",
                    description: "Extension built and downloaded. Ready to load in Chrome!",
                  });
                } catch (error: any) {
                  console.error("Export error:", error);
                  buildingToast.dismiss?.();
                  toast({
                    title: "Export Failed",
                    description: error.message || "Failed to build extension. Check the terminal for errors.",
                    variant: "destructive",
                  });
                }
              } else {
                // Direct source export - works even when preview isn't loaded
                const exportingToast = toast({
                  title: "Exporting Source Files...",
                  description: "Packaging your extension source files.",
                });
                
                try {
                  await downloadSourceFiles(extensionFiles, projectTitle);
                  
                  exportingToast.dismiss?.();
                  toast({
                    title: "Source Exported!",
                    description: "Source files downloaded. Run 'npm install && npm run build' to compile.",
                  });
                } catch (error: any) {
                  console.error("Export error:", error);
                  exportingToast.dismiss?.();
                  toast({
                    title: "Export Failed",
                    description: error.message || "Failed to export source files.",
                    variant: "destructive",
                  });
                }
              }
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
      
      {/* Out of Credits Modal */}
      <OutOfCreditsModal 
        open={showOutOfCreditsModal} 
        onOpenChange={setShowOutOfCreditsModal} 
      />

      {/* Rename Project Modal */}
      <Dialog 
        open={showRenameModal} 
        onOpenChange={(open) => {
          setShowRenameModal(open);
          if (open) {
            setRenameValue(projectTitle);
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-[#1F2020] border-[#2a2a2a] text-white">
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name" className="text-gray-400">Project name</Label>
              <Input
                id="project-name"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRenameProject();
                  }
                }}
                placeholder="Enter project name"
                className="bg-[#161B1B] border-[#3a3a3a] text-white placeholder:text-gray-500 focus:border-[#5A9665] focus:ring-[#5A9665]"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setShowRenameModal(false)}
              className="text-gray-400 hover:text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameProject}
              disabled={!renameValue.trim() || renameValue.trim() === projectTitle}
              className="bg-[#5A9665] hover:bg-[#4a8655] text-white"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
