import { Search, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { CATEGORIES, determineCategoryFromText, type ProjectCategory } from "@/lib/categories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { supabase } from "../integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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

  // Auto-categorize projects
  useEffect(() => {
    if (loading || !projects.length) return;
    
    const uncategorized = projects.filter(p => !p.category);
    if (uncategorized.length === 0) return;

    const updateCategories = async () => {
      const updates = uncategorized.map(async (p) => {
        const category = determineCategoryFromText((p.title || "") + " " + (p.description || ""));
        
        // Update DB
        await supabase
          .from('projects')
          .update({ category })
          .eq('id', p.id);
          
        return { id: p.id, category };
      });

      const results = await Promise.all(updates);
      
      // Update local state
      setProjects(current => current.map(p => {
        const update = results.find(r => r.id === p.id);
        return update ? { ...p, category: update.category } : p;
      }));
    };

    updateCategories();
  }, [projects, loading]);


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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredProjects.map((project) => {
            const categoryName = project.category || determineCategoryFromText((project.title || "") + " " + (project.description || ""));
            const CategoryIcon = CATEGORIES[categoryName as ProjectCategory] || CATEGORIES["Other"];
            
            return (
            <div
              key={project.id}
              className="group cursor-pointer bg-[#1a1a1a] rounded-xl border border-[#333] p-3 hover:border-[#555] transition-colors relative aspect-[5/4] flex flex-col"
              onClick={() => navigate("/build", { state: { project } })}
            >
              {/* Delete button */}
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-red-400 transition-colors p-1 rounded-md hover:bg-red-500/10 opacity-0 group-hover:opacity-100 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Are you sure you want to delete this project?")) {
                    handleDeleteProject(project.id);
                  }
                }}
                title="Delete project"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Icon */}
              <div className="flex-1 flex items-center justify-center">
                <div className="w-14 h-14 bg-gradient-to-br from-[#5A9665] to-[#5f87a3] rounded-xl flex items-center justify-center shadow-lg">
                  <CategoryIcon className="text-white w-7 h-7" />
                </div>
              </div>

              {/* Content */}
              <div className="text-center mt-2">
                <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">{categoryName}</p>
                <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors text-sm truncate px-1">
                  {project.title}
                </h3>
                <p className="text-[10px] text-gray-500 mt-1">
                  {new Date(project.updated_at ?? project.created_at ?? Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
