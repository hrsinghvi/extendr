import { Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Mock data
const projects = [
    {
        id: 1,
        title: "Bolt AI Landing",
        editedTime: "2 hours ago",
        image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2Vic2l0ZXxlbnwwfHwwfHx8MA%3D%3D",
        type: "Website",
        isPublished: false
    },
    {
        id: 2,
        title: "THE 1600 league website",
        editedTime: "4 days ago",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d2Vic2l0ZXxlbnwwfHwwfHx8MA%3D%3D",
        type: "Website",
        isPublished: true
    }
];

export function RecentProjects() {
    return (
        <div className="w-full max-w-7xl mx-auto mt-8 p-5 rounded-3xl bg-[#232323] border border-[#2a2a2a]">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Recent Projects</h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                        placeholder="Search projects..."
                        className="pl-9 bg-[#161B1B] border-[#2a2a2a] text-white placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-gray-700"
                    />
                </div>
                <Select defaultValue="last-edited">
                    <SelectTrigger className="w-[180px] bg-[#161B1B] border-[#2a2a2a] text-white">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#161B1B] border-[#2a2a2a] text-white">
                        <SelectItem value="last-edited">Last edited</SelectItem>
                        <SelectItem value="created">Created</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                </Select>
                <Select defaultValue="all-creators">
                    <SelectTrigger className="w-[180px] bg-[#161B1B] border-[#2a2a2a] text-white">
                        <SelectValue placeholder="Filter by" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#161B1B] border-[#2a2a2a] text-white">
                        <SelectItem value="all-creators">All creators</SelectItem>
                        <SelectItem value="me">Me</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <div key={project.id} className="group cursor-pointer">
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-[#2a2a2a] bg-[#161B1B] mb-3 group-hover:border-gray-600 transition-colors">
                            <img
                                src={project.image}
                                alt={project.title}
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                            {project.isPublished && (
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
                                    <h3 className="font-medium text-white group-hover:text-primary transition-colors">{project.title}</h3>
                                    {project.type === "Website" && (
                                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-[#2a2a2a] text-orange-300 hover:bg-[#333]">
                                            Website
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 pl-8">Edited {project.editedTime}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
