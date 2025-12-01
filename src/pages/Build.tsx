import { useState, useEffect, useRef, useCallback } from "react";
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
  type FileMap
} from "@/preview";
import {
  DEFAULT_MANIFEST,
  DEFAULT_POPUP_HTML,
  DEFAULT_POPUP_CSS,
  DEFAULT_POPUP_JS,
  DEFAULT_SERVICE_WORKER,
  DEFAULT_CONTENT_SCRIPT,
  DEFAULT_CONTENT_CSS
} from "@/extensions/chrome_mv3";

// Types for chat and messages
interface Message {
  id: string;
  chat_id: string;
  user_id: string;
  content: string;
  role: "user" | "assistant";
  created_at: string;
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
 * Extendr System Prompt - Tailored for Chrome Extension Development
 */
const EXTENDR_SYSTEM_PROMPT = `You are Extendr, an AI assistant specialized in creating and modifying Chrome extensions. You help users build Chrome extensions by chatting with them and providing code guidance in real-time.

## Core Identity
You are the expert Chrome extension developer. You assist users by explaining concepts, writing code, debugging issues, and guiding them through the Chrome extension development process.

## Technology Stack (STRICTLY ENFORCED)
Extendr projects use ONLY these technologies:
- **Languages**: TypeScript, HTML, CSS, JavaScript
- **Styling**: Tailwind CSS, vanilla CSS
- **Chrome APIs**: All Chrome Extension APIs (tabs, storage, runtime, scripting, etc.)
- **Manifest**: Manifest V3 (MV3) - ALWAYS use Manifest V3, never V2

## What You CAN Build
- Chrome extensions (popup, background scripts, content scripts, options pages)
- Browser action extensions
- Page action extensions
- Context menu extensions
- DevTools extensions
- Extensions with side panels

## What You CANNOT Build
- Web applications (use Lovable for that)
- Mobile apps
- Desktop apps
- Firefox/Safari/Edge-specific extensions (Chrome only)
- Manifest V2 extensions (deprecated)

## Chrome Extension Structure
Always follow this standard structure:
\`\`\`
extension/
├── manifest.json          # Extension manifest (MV3)
├── popup/
│   ├── popup.html        # Popup UI
│   ├── popup.css         # Popup styles
│   └── popup.js          # Popup logic
├── background/
│   └── service-worker.js # Background service worker (MV3)
├── content/
│   ├── content.js        # Content scripts
│   └── content.css       # Content styles
└── assets/
    └── icons/            # Extension icons (16, 32, 48, 128px)
\`\`\`

## Manifest V3 Requirements
ALWAYS use Manifest V3 format:
- Use \`service_worker\` instead of \`background.scripts\`
- Use \`action\` instead of \`browser_action\` or \`page_action\`
- Declare permissions explicitly
- Use \`chrome.scripting\` API for dynamic script injection

## Code Guidelines
1. **Keep it modular**: Separate concerns (popup, background, content scripts)
2. **Error handling**: Always handle Chrome API errors gracefully
3. **Permissions**: Request only necessary permissions
4. **Storage**: Use chrome.storage.local or chrome.storage.sync appropriately
5. **Message passing**: Use chrome.runtime.sendMessage for communication
6. **Security**: Never use eval(), innerHTML with user content, or unsafe practices

## Response Style
- Be concise and direct
- Provide working code examples
- Explain Chrome-specific concepts when needed
- Always consider extension security best practices
- Format responses for readability

## Output Format (CRITICAL FOR LIVE PREVIEW)
When you provide code for an extension, you MUST include a JSON code block with the complete file contents. This enables the live preview feature.

Format your code output like this:

\`\`\`json
{
  "manifest.json": "{ \\"manifest_version\\": 3, ... }",
  "popup/popup.html": "<!DOCTYPE html>...",
  "popup/popup.css": "/* styles */...",
  "popup/popup.js": "// popup script...",
  "background/service-worker.js": "// background script...",
  "content/content.js": "// content script...",
  "content/content.css": "/* content styles */..."
}
\`\`\`

IMPORTANT:
- Always provide COMPLETE file contents, not snippets
- Use proper JSON escaping for string values
- Include ALL files needed for the extension to work
- The manifest.json value should be a JSON string (double-escaped)

## Debugging Help
When users have issues:
1. Check manifest.json for errors
2. Verify permissions are declared
3. Check service worker console for background script errors
4. Check browser console for popup/content script errors
5. Verify content script matches are correct

Reply in the same language as the user. Keep responses focused and actionable.`;

/**
 * Parse extension files from AI response
 */
function parseExtensionFiles(response: string): FileMap | null {
  try {
    // Look for JSON code block
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) return null;

    const jsonStr = jsonMatch[1].trim();
    const parsed = JSON.parse(jsonStr);

    // Validate it's an object with file paths
    if (typeof parsed !== 'object' || parsed === null) return null;

    // Convert to FileMap
    const files: FileMap = {};
    for (const [path, content] of Object.entries(parsed)) {
      if (typeof content === 'string') {
        files[path] = content;
      } else if (typeof content === 'object') {
        // Handle manifest.json as object
        files[path] = JSON.stringify(content, null, 2);
      }
    }

    return Object.keys(files).length > 0 ? files : null;
  } catch (error) {
    console.error('Failed to parse extension files:', error);
    return null;
  }
}

/**
 * Get default extension files
 */
function getDefaultExtensionFiles(): FileMap {
  return {
    'manifest.json': JSON.stringify(DEFAULT_MANIFEST, null, 2),
    'popup/popup.html': DEFAULT_POPUP_HTML,
    'popup/popup.css': DEFAULT_POPUP_CSS,
    'popup/popup.js': DEFAULT_POPUP_JS,
    'background/service-worker.js': DEFAULT_SERVICE_WORKER,
    'content/content.js': DEFAULT_CONTENT_SCRIPT,
    'content/content.css': DEFAULT_CONTENT_CSS
  };
}

/**
 * Calls Gemini API to generate a response
 */
async function callGeminiAPI(
  userMessage: string,
  conversationHistory: Message[]
): Promise<string> {
  const rawApiKey = import.meta.env.VITE_GEMINI_API_KEY ?? "";
  const apiKey = rawApiKey.replace(/^["'](.*)["']$/, "$1").trim();
  
  if (!apiKey) {
    console.warn("Gemini API key not configured");
    return "Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.";
  }
  
  if (!apiKey.startsWith("AIza")) {
    console.error("API key doesn't look like a valid Google AI key");
    return "Your API key doesn't appear to be a valid Google AI key. Please get a key from https://aistudio.google.com/app/apikey";
  }
  
  const contents = [];
  
  for (const msg of conversationHistory) {
    contents.push({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    });
  }

  contents.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  const modelsToTry = [
    "gemini-2.0-flash-exp",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro",
  ];

  let lastError = "";

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      const requestBody = {
        contents,
        systemInstruction: {
          parts: [{ text: EXTENDR_SYSTEM_PROMPT }]
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      };
      
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText };
        }
        lastError = errorData?.error?.message || errorData?.message || `HTTP ${response.status}`;
        continue;
      }

      const data = JSON.parse(responseText);
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (generatedText) {
        return generatedText;
      } else {
        lastError = "No text generated";
      }
    } catch (err: any) {
      lastError = err.message || "Unknown error";
      continue;
    }
  }

  return `I couldn't connect to the AI service. Error: ${lastError}. Please verify your API key at https://aistudio.google.com/app/apikey`;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  
  // Extension files state
  const [extensionFiles, setExtensionFiles] = useState<FileMap>(getDefaultExtensionFiles());

  // WebContainer hook
  const {
    status,
    previewUrl,
    logs,
    build,
    stop,
    clearLogs,
    updateFiles
  } = useWebContainer({
    onPreviewUrl: (url) => {
      console.log('Preview URL:', url);
    },
    onError: (error) => {
      toast({
        title: 'Build Error',
        description: error,
        variant: 'destructive'
      });
    }
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/");
        return;
      }
      
      setUser(session.user);
      const userId = session.user.id;
      
      const projectIdFromUrl = searchParams.get("project");
      
      if (projectIdFromUrl) {
        const existingProject = await loadProjectById(projectIdFromUrl, userId);
        if (existingProject) {
          setProject(existingProject);
          setProjectTitle(existingProject.title);
          await loadOrCreateChat(userId, existingProject.id);
          setIsLoading(false);
          return;
        }
      }
      
      if (location.state?.project) {
        const proj = location.state.project as Project;
        setProject(proj);
        setProjectTitle(proj.title);
        setSearchParams({ project: proj.id }, { replace: true });
        await loadOrCreateChat(userId, proj.id);
        setIsLoading(false);
        return;
      }

        if (location.state?.prompt) {
        const generatedTitle = generateProjectTitle(location.state.prompt);
        const newProject = await createProject(userId, generatedTitle);
        if (newProject) {
          setProject(newProject);
          setProjectTitle(newProject.title);
          setSearchParams({ project: newProject.id }, { replace: true });
          const chat = await createChat(userId, newProject.id, "Initial Chat");
          if (chat) {
            setCurrentChat(chat);
            await sendMessage(location.state.prompt, chat.id, userId);
          }
        }
        setIsLoading(false);
        return;
      }
      
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
  async function createProject(userId: string, title: string): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert({ user_id: userId, title })
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
      console.log('Project files saved successfully');
    } catch (err: any) {
      console.error('Error saving project files:', err);
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
      
      setMessages((data as Message[]) || []);
      
      // Try to extract files from the last assistant message
      if (data && data.length > 0) {
        for (let i = data.length - 1; i >= 0; i--) {
          if (data[i].role === 'assistant') {
            const files = parseExtensionFiles(data[i].content);
            if (files) {
              setExtensionFiles(prev => ({ ...prev, ...files }));
              break;
            }
          }
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
   * Sends a message and gets AI response
   */
  async function sendMessage(content: string, chatId: string, userId: string) {
    if (!content.trim() || !chatId || !userId) return;
    
    setIsThinking(true);
    
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
      
      const newUserMessage = userMsg as Message;
      setMessages((prev) => [...prev, newUserMessage]);
      
      // Update chat timestamp
      await supabase
        .from("chats")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", chatId);
      
      // Get AI response
      let aiResponse: string;
      try {
        aiResponse = await callGeminiAPI(content.trim(), messages);
      } catch (apiError: any) {
        aiResponse = `I encountered an error: ${apiError.message}. Please try again.`;
      }
      
      // Save assistant message
      const { data: assistantMsg, error: assistantMsgError } = await supabase
        .from("messages")
        .insert({
          chat_id: chatId,
          user_id: userId,
          content: aiResponse,
          role: "assistant",
        })
        .select()
        .single();
      
      if (assistantMsgError) throw assistantMsgError;
      
      setMessages((prev) => [...prev, assistantMsg as Message]);

      // Parse extension files from response
      const parsedFiles = parseExtensionFiles(aiResponse);
      if (parsedFiles) {
        const updatedFiles = { ...extensionFiles, ...parsedFiles };
        setExtensionFiles(updatedFiles);
        
        // Save to project
        if (project) {
          await saveProjectFiles(project.id, updatedFiles);
        }
        
        // Update WebContainer files
        await updateFiles(parsedFiles, true);
        
        toast({
          title: "Extension Updated",
          description: "Code has been updated. Click 'Build & Run' to preview.",
        });
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
    
    // Debounced save to project
    if (project) {
      saveProjectFiles(project.id, newFiles);
    }
  }, [project]);

  /**
   * Handle build button click
   */
  const handleBuild = useCallback(() => {
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
                    <div className="h-full bg-purple-600 w-[60%]"></div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-2 h-2 rounded-full bg-purple-600"></div>
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
                <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
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
                        ? "bg-purple-600 text-white"
                        : "bg-[#2a2a2a] text-white"
                        }`}
                    >
                      {message.role === 'assistant' ? (
                        <AIMessage content={message.content} />
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
              <div className="flex items-center gap-2 text-gray-400">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
                <span className="text-sm">Thinking...</span>
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
        <div className="flex-1 flex flex-col min-w-0">
          {/* Preview Top Bar */}
          <div className="h-12 flex items-center justify-between px-4 bg-[#232323] border-b border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">Extension Preview</span>
              <span className="text-xs text-gray-500">• WebContainers</span>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs text-gray-400 hover:text-white hover:bg-[#2a2a2a] gap-1.5"
                onClick={() => {
                  // Download extension as ZIP
                  toast({
                    title: "Export Coming Soon",
                    description: "Extension export will be available soon.",
                  });
                }}
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </Button>
              <Button className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white px-3">
                Publish
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-[#2a2a2a]">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-medium">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
              </Button>
            </div>
          </div>

          {/* Preview Panel */}
          <PreviewPanel
            files={extensionFiles}
            onFilesChange={handleFilesChange}
            status={status}
            previewUrl={previewUrl}
            logs={logs}
            onBuild={handleBuild}
            onRun={handleRebuild}
            onStop={handleStop}
            onClearLogs={clearLogs}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
