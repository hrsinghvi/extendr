/**
 * RecentProjects - Displays user's recent projects
 * 
 * States:
 * - Auth loading: Shows spinner
 * - Not authenticated: Shows sign-in prompt
 * - Authenticated: Fetches and displays projects with search/sort
 */
import { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { notifyError } from "@/core/errorBus";
import { Project } from "@/types/database";
import { useAuth } from "@/context/AuthContext";

export function RecentProjects() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("last-edited");

  /**
   * Fetch projects from Supabase
   * Only called when user is authenticated
   */
  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      let query = supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id);

      // Apply sorting
      if (sortBy === "last-edited") {
        query = query.order('updated_at', { ascending: false });
      } else if (sortBy === "created") {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === "name") {
        query = query.order('title', { ascending: true });
      }

      const { data, error } = await query;

      if (error) throw error;

      setProjects((data as unknown as Project[]) || []);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      notifyError({
        title: "Failed to load projects",
        description: error?.message ?? "Please try again later.",
        variant: "destructive"
      });
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [user, sortBy]);

  // Fetch projects when auth state changes or sort changes
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    fetchProjects();
  }, [user, isAuthenticated, authLoading, fetchProjects]);

  /**
   * Format relative time string
   */
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // Filter projects by search query
  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading state (auth or projects)
  if (authLoading || loading) {
    return (
      <div className="w-full max-w-7xl mx-auto mt-8 p-5 rounded-3xl bg-[#232323] border border-[#2a2a2a]">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  // Not authenticated - show sign-in prompt
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

  // Authenticated - show projects
  return (
    <div className="w-full max-w-7xl mx-auto mt-8 p-5 rounded-3xl bg-[#232323] border border-[#2a2a2a]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Recent Projects</h2>
      </div>

      {/* Search and sort controls */}
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

      {/* Projects grid or empty state */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">
            {searchQuery 
              ? "No projects match your search." 
              : "No projects yet. Start building something amazing!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group cursor-pointer"
              onClick={() => navigate("/build", { state: { projectId: project.id } })}
            >
              {/* Project thumbnail */}
              <div className="relative aspect-video rounded-xl overflow-hidden border border-[#2a2a2a] bg-[#161B1B] mb-3 group-hover:border-gray-600 transition-colors">
                {project.image ? (
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    No preview
                  </div>
                )}
                {project.is_published && (
                  <Badge className="absolute bottom-3 left-3 bg-black/60 hover:bg-black/80 text-white border-none backdrop-blur-sm">
                    Published
                  </Badge>
                )}
              </div>

              {/* Project info */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-pink-600 flex items-center justify-center text-[10px] font-bold text-white">
                      {project.title.charAt(0)}
                    </div>
                    <h3 className="font-medium text-white group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <Badge 
                      variant="secondary" 
                      className="text-[10px] h-5 px-1.5 bg-[#2a2a2a] text-orange-300 hover:bg-[#333]"
                    >
                      {project.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 pl-8">
                    Edited {formatTimeAgo(project.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
