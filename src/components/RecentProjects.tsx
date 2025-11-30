import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Input } from "./ui/input";
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

  // Filtering
  const filteredProjects = projects.filter(p =>
    (p.title ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group cursor-pointer bg-[#1a1a1a] rounded-lg border border-[#333] p-4 flex items-start space-x-4 hover:border-[#555] transition-colors"
              onClick={() => navigate("/build", { state: { project } })}
            >
              <div className="flex-shrink-0 text-center">
                {/* Icon container */}
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mx-auto mb-1">
                  <span className="text-white text-lg">📦</span>
                </div>
                <p className="text-xs text-blue-400">Extension</p>
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors text-lg">
                    {project.title}
                  </h3>
                  <span className="text-gray-400 text-sm">→</span>
                </div>
                <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                  {project.description || "A custom Chrome extension built with AI assistance."}
                </p>
                <p className="text-xs text-gray-500">Updated {new Date(project.updated_at ?? project.created_at ?? Date.now()).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
