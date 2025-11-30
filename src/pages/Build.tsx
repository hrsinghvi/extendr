import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, ArrowLeft, RefreshCw, Edit2, Moon, HelpCircle, ArrowUpRight, Settings, Download } from "lucide-react";
import { ExtensionPreview } from "@/components/preview";
import { Button } from "@/components/ui/button";
import { PromptInputBox } from "@/components/ui/prompt-input-box";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

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
- **Languages**: JavaScript, TypeScript, HTML, CSS
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
│   └── content.js        # Content scripts
├── options/
│   ├── options.html      # Options page
│   └── options.js        # Options logic
├── assets/
│   └── icons/            # Extension icons (16, 32, 48, 128px)
└── styles/
    └── tailwind.css      # If using Tailwind
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
- Test suggestions mentally before providing them

## Debugging Help
When users have issues:
1. Check manifest.json for errors
2. Verify permissions are declared
3. Check service worker console for background script errors
4. Check browser console for popup/content script errors
5. Verify content script matches are correct

## Common Patterns You Know Well
- Tab manipulation (create, update, query, remove)
- Storage operations (get, set, remove, clear)
- Content script injection
- Message passing between components
- Context menu creation
- Badge updates
- Notifications
- Alarms and scheduling
- Web requests interception

Reply in the same language as the user. Keep responses focused and actionable.`;

/**
 * Calls Gemini API to generate a response
 * Uses Google AI Studio API (ai.google.dev)
 * @param userMessage - The user's message
 * @param conversationHistory - Previous messages for context
 */
async function callGeminiAPI(
  userMessage: string,
  conversationHistory: Message[]
): Promise<string> {
  // Gemini API key from env; tolerate quoted values
  const rawApiKey = import.meta.env.VITE_GEMINI_API_KEY ?? "";
  const apiKey = rawApiKey.replace(/^["'](.*)["']$/, "$1").trim();
  
  if (!apiKey) {
    console.warn("Gemini API key not configured");
    return "Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.";
  }
  
  // Check if the API key looks valid (Google AI keys start with "AIza")
  if (!apiKey.startsWith("AIza")) {
    console.error("API key doesn't look like a valid Google AI key. It should start with 'AIza'");
    return "Your API key doesn't appear to be a valid Google AI key. Please get a key from https://aistudio.google.com/app/apikey";
  }
  
  console.log("Gemini API key loaded (first 8 chars):", apiKey.substring(0, 8) + "...");

  // Build conversation - for multi-turn, include history
  const contents = [];
  
  // Add conversation history if any
  for (const msg of conversationHistory) {
    contents.push({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    });
  }

  // Add the current user message
  contents.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  // Models to try - using Google AI Studio model names
  const modelsToTry = [
    "gemini-2.0-flash-exp",  // Experimental flash
    "gemini-2.0-flash",      // Latest flash model
    "gemini-1.5-flash",      // Previous flash  
    "gemini-1.5-pro",        // Pro model
    "gemini-pro",            // Legacy pro
  ];

  let lastError = "";

  for (const model of modelsToTry) {
    try {
      console.log(`Trying Gemini model: ${model}`);
      
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
      
      console.log("Request URL:", url.replace(apiKey, "API_KEY_HIDDEN"));
      
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      console.log(`Response status for ${model}:`, response.status, response.statusText);

      const responseText = await response.text();

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText };
        }
        console.error(`Gemini API error for ${model}:`, errorData);
        lastError = errorData?.error?.message || errorData?.message || `HTTP ${response.status}`;
        continue; // Try next model
      }

      const data = JSON.parse(responseText);
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (generatedText) {
        console.log("Successfully got response from model:", model);
        return generatedText;
      } else {
        console.warn("No text in response for model:", model, data);
        lastError = "No text generated";
      }
    } catch (err: any) {
      console.error(`Error with model ${model}:`, err);
      lastError = err.message || "Unknown error";
      continue; // Try next model
    }
  }

  // If all models failed
  console.error("All Gemini models failed. Last error:", lastError);
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
  
  // Extension code state
  const [extensionCode, setExtensionCode] = useState({
    html: "",
    css: "",
    js: "",
    manifest: "",
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
      console.log("Loading project by ID:", projectId);
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
      
      // Priority 1: Check URL for project ID (survives page reload)
      const projectIdFromUrl = searchParams.get("project");
      
      if (projectIdFromUrl) {
        console.log("Loading project from URL param:", projectIdFromUrl);
        const existingProject = await loadProjectById(projectIdFromUrl, userId);
        if (existingProject) {
          setProject(existingProject);
          setProjectTitle(existingProject.title);
          await loadOrCreateChat(userId, existingProject.id);
          setIsLoading(false);
          return;
        }
      }
      
      // Priority 2: Check navigation state (from clicking a project card)
      if (location.state?.project) {
        const proj = location.state.project as Project;
        console.log("Loading project from navigation state:", proj.id);
        setProject(proj);
        setProjectTitle(proj.title);
        
        // Update URL with project ID so it survives reload
        setSearchParams({ project: proj.id }, { replace: true });
        
        await loadOrCreateChat(userId, proj.id);
        setIsLoading(false);
        return;
      }

      // Priority 3: New project from hero prompt
        if (location.state?.prompt) {
        console.log("Creating new project from prompt");
        const generatedTitle = generateProjectTitle(location.state.prompt);
        const newProject = await createProject(userId, generatedTitle);
        if (newProject) {
          setProject(newProject);
          setProjectTitle(newProject.title);
          
          // Update URL with new project ID
          setSearchParams({ project: newProject.id }, { replace: true });
          
          // Create chat and send initial message
          const chat = await createChat(userId, newProject.id, "Initial Chat");
          if (chat) {
            setCurrentChat(chat);
            await sendMessage(location.state.prompt, chat.id, userId);
          }
        }
        setIsLoading(false);
        return;
      }
      
      // Priority 4: No context - load most recent project or create new one
      console.log("No project context, loading most recent project...");
      const { data: recentProjects, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(1);
      
      if (!error && recentProjects && recentProjects.length > 0) {
        const recentProject = recentProjects[0] as Project;
        console.log("Loaded most recent project:", recentProject.id);
        setProject(recentProject);
        setProjectTitle(recentProject.title);
        setSearchParams({ project: recentProject.id }, { replace: true });
        await loadOrCreateChat(userId, recentProject.id);
      } else {
        // No projects exist - create a new one
        console.log("No existing projects, creating new one");
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

    // Listen for auth changes
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
    // Convert to lowercase for easier processing
    const lowerPrompt = prompt.toLowerCase();
    
    // Common patterns and their corresponding titles
    const patterns = [
      { regex: /tic\s*tac\s*toe|tictactoe|noughts\s*and\s*crosses/, title: "Tic Tac Toe" },
      { regex: /calculator|math|calculate/, title: "Calculator" },
      { regex: /todo|task\s*list|to\s*do/, title: "Todo List" },
      { regex: /weather|forecast|temperature/, title: "Weather App" },
      { regex: /clock|timer|alarm/, title: "Clock" },
      { regex: /notes|notebook|journal/, title: "Notes" },
      { regex: /calendar|schedule|planner/, title: "Calendar" },
      { regex: /game|play|gaming/, title: "Game" },
      { regex: /chat|messenger|message/, title: "Chat App" },
      { regex: /social|network|connect/, title: "Social Network" },
      { regex: /music|player|song/, title: "Music Player" },
      { regex: /video|youtube|stream/, title: "Video App" },
      { regex: /photo|image|camera|gallery/, title: "Photo App" },
      { regex: /blog|post|article/, title: "Blog" },
      { regex: /shop|store|ecommerce|buy/, title: "Shop" },
      { regex: /map|navigation|gps|location/, title: "Map" },
      { regex: /dictionary|translate|language/, title: "Dictionary" },
      { regex: /password|security|login|auth/, title: "Security" },
      { regex: /file|document|pdf|word/, title: "Document App" },
      { regex: /extension|chrome|browser/, title: "Browser Extension" }
    ];
    
    // Check if prompt matches any pattern
    for (const pattern of patterns) {
      if (pattern.regex.test(lowerPrompt)) {
        return pattern.title;
      }
    }
    
    // Extract first meaningful phrase (2-3 words)
    const words = prompt.split(' ').filter(word => 
      word.length > 2 && 
      !['the', 'and', 'or', 'but', 'for', 'with', 'that', 'this', 'from', 'have', 'they', 'been'].includes(word.toLowerCase())
    );
    
    if (words.length >= 2) {
      // Take first 2-3 meaningful words and capitalize them
      const titleWords = words.slice(0, Math.min(3, words.length))
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
      return titleWords.join(' ');
    }
    
    // Fallback: use first word capitalized
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
   * Loads existing chat for a project or creates a new one
   */
  async function loadOrCreateChat(userId: string, projectId: string) {
    try {
      console.log("Loading chat for project:", projectId);
      
      // Try to find existing chat
      const { data: existingChats, error: fetchError } = await supabase
        .from("chats")
        .select("*")
        .eq("project_id", projectId)
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(1);
      
      if (fetchError) throw fetchError;
      
      console.log("Found existing chats:", existingChats?.length || 0);
      
      if (existingChats && existingChats.length > 0) {
        const chat = existingChats[0] as Chat;
        console.log("Using existing chat:", chat.id);
        setCurrentChat(chat);
        await loadMessages(chat.id);
      } else {
        // Create new chat
        console.log("Creating new chat for project:", projectId);
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
      console.log("Loading messages for chat:", chatId);
      
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      
      console.log("Loaded messages count:", data?.length || 0);
      if (data && data.length > 0) {
        console.log("First message:", data[0]);
        console.log("Last message:", data[data.length - 1]);
      }
      
      setMessages((data as Message[]) || []);
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
    if (!content.trim() || !chatId || !userId) {
      console.error("sendMessage called with invalid params:", { content: !!content, chatId, userId });
      return;
    }
    
    console.log("Sending message to chat:", chatId);
    setIsThinking(true);
    
    try {
      // Save user message to Supabase
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
      
      if (userMsgError) {
        console.error("Error saving user message:", userMsgError);
        throw userMsgError;
      }
      
      console.log("User message saved:", userMsg);
      
      // Update local state immediately
      const newUserMessage = userMsg as Message;
      setMessages((prev) => [...prev, newUserMessage]);
      
      // Update chat's updated_at
      await supabase
        .from("chats")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", chatId);
      
      // Get AI response from Gemini
      let aiResponse: string;
      try {
        aiResponse = await callGeminiAPI(content.trim(), messages);
      } catch (apiError: any) {
        aiResponse = `I encountered an error while processing your request: ${apiError.message}. Please try again.`;
      }
      
      // Save assistant message to Supabase
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
      
      if (assistantMsgError) {
        console.error("Error saving assistant message:", assistantMsgError);
        throw assistantMsgError;
      }
      
      console.log("Assistant message saved:", assistantMsg);
      
      // Update local state
      setMessages((prev) => [...prev, assistantMsg as Message]);
      
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
        <div className="bg-[#232323] flex flex-col w-1/3 min-w-[300px]">
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
                <p className="text-gray-500 text-sm">How can I help you build today?</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-4 py-3 ${
                        message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-[#2a2a2a] text-white"
                        }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
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
              onSend={handleSendMessage}
              isLoading={isThinking}
              placeholder="Ask me anything about building your app..."
              className="bg-[#232323] border-[#3C4141] rounded-lg"
            />
          </div>
        </div>

        {/* Right side - Preview */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#232323]">
          {/* Preview Top Bar */}
          <div className="h-12 flex items-center justify-between px-4 bg-[#232323]">
            {/* Title */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">Extension Preview</span>
              <span className="text-xs text-gray-500">• Live</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs text-gray-400 hover:text-white hover:bg-[#2a2a2a] gap-1.5"
                onClick={() => {
                  // Download extension as ZIP (placeholder)
                  console.log("Download extension");
                }}
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </Button>
              <Button className="h-8 text-xs bg-primary hover:bg-primary/90 text-white px-3">
                Publish
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-[#2a2a2a]">
                <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
              </Button>
            </div>
          </div>

          {/* Live Preview Component */}
          <div className="flex-1 p-4 pt-0">
            <ExtensionPreview
              className="h-full border border-[#333] shadow-2xl"
              onCodeChange={(code) => setExtensionCode(code)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
