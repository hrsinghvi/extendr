import { Search, Trash2, ArrowRight, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { CATEGORIES, determineCategoryFromText, type ProjectCategory } from "@/lib/categories";
import { GradientIcon } from "./GradientIcon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { supabase } from "../integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

/**
 * Format a date as "X time ago"
 */
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return `Updated ${seconds} seconds ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Updated ${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Updated ${hours} hour${hours !== 1 ? 's' : ''} ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 30) return `Updated ${days} day${days !== 1 ? 's' : ''} ago`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `Updated ${months} month${months !== 1 ? 's' : ''} ago`;
  
  const years = Math.floor(months / 12);
  return `Updated ${years} year${years !== 1 ? 's' : ''} ago`;
}

// Dummy data removed; data now loaded from MCP (public.projects) per-auth user
// We intentionally fetch the current session via Supabase client (no AuthContext dependency)

export function RecentProjects() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const [hasNavigatedOnLogin, setHasNavigatedOnLogin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  type Project = any;
  const [projects, setProjects] = useState<any[]>([]);
  // Gradient height anchoring: keep gradient fixed at bottom and extend with more projects
  const [gradientHeight, setGradientHeight] = useState<number>(320);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("last-edited");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; title: string } | null>(null);

  // Redirect to landing page on login
  useEffect(() => {
    if (isAuthenticated && !hasNavigatedOnLogin) {
      if (location.pathname !== "/") {
        navigate("/");
      }
      setHasNavigatedOnLogin(true);
    }
  }, [isAuthenticated, location.pathname, hasNavigatedOnLogin]);

  // Check auth state
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setUser(session?.user || null);
      setAuthLoading(false);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setUser(session?.user || null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load MCP-backed projects for the current user
  useEffect(() => {
    let mounted = true;
    const loadProjects = async () => {
      if (authLoading) return;
      if (!isAuthenticated || !user?.id) {
        setProjects([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("user_id", user!.id)
          .order("updated_at", { ascending: false });
        if (error) throw error;
        if (mounted) {
          setProjects(data as any[]);
        }
      } catch (err: any) {
        console.error("Load projects error:", err);
        toast({ 
          title: "Error loading projects", 
          description: err?.message || "Failed to load projects", 
          variant: "destructive" 
        });
        if (mounted) {
          setProjects([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    loadProjects();
    // Update gradient height based on project count
    setGradientHeight(Math.max(320, projects.length * 60));
    return () => {
      mounted = false;
    };
  }, [authLoading, isAuthenticated, user?.id, toast, projects.length]);

  // Auto-categorize projects and generate descriptions
  useEffect(() => {
    if (loading || !projects.length) return;
    
    const needsUpdate = projects.filter(p => !p.category || !p.description);
    if (needsUpdate.length === 0) return;

    const updateProjects = async () => {
      const updates = needsUpdate.map(async (p) => {
        const category = p.category || determineCategoryFromText((p.title || "") + " " + (p.description || ""));
        
        // Generate description if missing
        let description = p.description;
        if (!description && p.title) {
          // Create a simple description based on title and category
          description = generateDescription(p.title, category);
        }
        
        // Update DB
        await supabase
          .from('projects')
          .update({ category, description })
          .eq('id', p.id);
          
        return { id: p.id, category, description };
      });

      const results = await Promise.all(updates);
      
      // Update local state
      setProjects(current => current.map(p => {
        const update = results.find(r => r.id === p.id);
        return update ? { ...p, category: update.category, description: update.description } : p;
      }));
    };

    updateProjects();
  }, [projects, loading]);

  /**
   * Generate a description based on title and category
   */
  function generateDescription(title: string, category: string): string {
    const titleLower = title.toLowerCase();
    
    // Category-based descriptions
    const categoryDescriptions: Record<string, string> = {
      "Productivity": `${title} is a productivity extension that helps you work smarter and stay organized.`,
      "Developer Tools": `${title} is a developer tool that enhances your coding workflow and development experience.`,
      "Social & Communication": `${title} is a social extension that improves your online communication and networking.`,
      "Shopping & Finance": `${title} is a shopping and finance tool that helps you save money and manage purchases.`,
      "Entertainment": `${title} is an entertainment extension that enhances your browsing and media experience.`,
      "Privacy & Security": `${title} is a privacy and security tool that protects your data and online activity.`,
      "News & Research": `${title} is a research tool that helps you discover and organize information.`,
      "Accessibility": `${title} is an accessibility tool that makes the web more usable for everyone.`,
      "Games": `${title} is a fun game extension that you can play right in your browser.`,
    };
    
    return categoryDescriptions[category] || `${title} is a Chrome extension that enhances your browsing experience.`;
  }


  // Filtering
  const filteredProjects = projects.filter(p =>
    (p.title ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);
      
      if (error) throw error;

      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      toast({
        title: "Project deleted",
        description: "The project has been successfully deleted.",
      });
    } catch (err: any) {
      console.error("Error deleting project:", err);
      toast({
        title: "Error deleting project",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="w-full max-w-7xl mx-auto mt-8 p-5 rounded-3xl bg-[#232323]">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-7xl mx-auto mt-8 p-5 rounded-3xl bg-[#232323]">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Projects</h2>
        <div className="text-center py-12">
          <p className="text-gray-400">Sign in to see your recent projects.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto mt-8 p-5 rounded-3xl bg-[#232323]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Recent Projects</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-[#161B1B] border-[#2a2a2a] text-white placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-gray-700"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px] bg-[#161B1B] border-[#2a2a2a] text-white">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-[#161B1B] border-[#2a2a2a] text-white">
            <SelectItem value="last-edited">Last edited</SelectItem>
            <SelectItem value="created">Created</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No projects yet. Start building something amazing!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
          {filteredProjects.map((project) => {
            const categoryName = project.category || determineCategoryFromText((project.title || "") + " " + (project.description || ""));
            const CategoryIcon = CATEGORIES[categoryName as ProjectCategory] || CATEGORIES["Other"];
            const description = project.description || generateDescription(project.title || "Extension", categoryName);
            
            return (
              <div
                key={project.id}
                className="group cursor-pointer bg-[#1a1a1a] rounded-2xl border border-[#333] hover:border-[#555] transition-all hover:bg-[#1f1f1f] flex items-stretch gap-4 p-4 relative"
                onClick={() => navigate("/build", { state: { project } })}
              >
                {/* Left: Icon Box */}
                <div className="w-20 h-20 flex-shrink-0 bg-[#0d1117] rounded-xl flex flex-col items-center justify-center shadow-lg">
                  <GradientIcon icon={CategoryIcon} className="w-8 h-8 mb-1" />
                  <span className="text-[9px] text-gray-500 font-medium truncate max-w-[70px] text-center">{categoryName}</span>
                </div>

                {/* Right: Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
                  {/* Title with arrow */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <h3 className="font-semibold text-white group-hover:text-[#5A9665] transition-colors text-base truncate">
                      {project.title}
                    </h3>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#5A9665] transition-colors flex-shrink-0" />
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                    {description}
                  </p>
                  
                  {/* Updated time */}
                  <p className="text-xs text-[#5A9665]">
                    {formatTimeAgo(new Date(project.updated_at ?? project.created_at ?? Date.now()))}
                  </p>
                </div>

                {/* Delete button - only visible on hover */}
                <button
                  className="absolute top-3 right-3 flex-shrink-0 text-gray-500 hover:text-red-400 transition-all p-2 rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setProjectToDelete({ id: project.id, title: project.title });
                    setDeleteDialogOpen(true);
                  }}
                  title="Delete project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#1a1a1a] border-[#333] max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-red-500/10">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <AlertDialogTitle className="text-white text-lg">
                Delete Project
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-400 text-sm">
              Are you sure you want to delete{" "}
              <span className="text-white font-medium">"{projectToDelete?.title}"</span>?
              This action cannot be undone and all project data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel 
              className="bg-[#2a2a2a] border-[#444] text-white hover:bg-[#333] hover:text-white"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white border-0"
              onClick={() => {
                if (projectToDelete) {
                  handleDeleteProject(projectToDelete.id);
                }
                setProjectToDelete(null);
              }}
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
