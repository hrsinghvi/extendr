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
      <div className="w-full max-w-7xl mx-auto mt-8 p-5 rounded-3xl bg-[#232323] border border-[#2a2a2a]">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-7xl mx-auto mt-8 p-5 rounded-3xl bg-[#232323] border border-[#2a2a2a]">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Projects</h2>
        <div className="text-center py-12">
          <p className="text-gray-400">Sign in to see your recent projects.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto mt-8 p-5 rounded-3xl bg-[#232323] border border-[#2a2a2a]" style={{ position: "relative" }}>
      <div aria-hidden="true" style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: gradientHeight + "px",
        background: "linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0))",
        pointerEvents: "none",
      }} />
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
              className="group cursor-pointer"
              onClick={() => navigate("/build", { state: { project } })}
            >
              <div className="relative aspect-video rounded-xl overflow-hidden border border-[#2a2a2a] bg-[#161B1B] mb-3 group-hover:border-gray-600 transition-colors">
                <img
                  src={project.image_url ?? ""}
                  alt={project.title ?? "Untitled"}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                {project.is_published && (
                  <Badge className="absolute bottom-3 left-3 bg-black/60 hover:bg-black/80 text-white border-none backdrop-blur-sm">
                    Published
                  </Badge>
                )}
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-pink-600 flex items-center justify-center text-[10px] font-bold text-white">
                      {project.title.charAt(0)}
                    </div>
                    <h3 className="font-medium text-white group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-[#2a2a2a] text-orange-300 hover:bg-[#333]">
                      Website
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 pl-8">Updated {new Date(project.updated_at ?? project.created_at ?? Date.now()).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
