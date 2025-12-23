export interface Project {
  id: string;
  user_id: string;
  title: string;
  image: string | null;
  type: string;
  is_published: boolean;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  features: string[];
  created_at: string;
  updated_at: string;
}
