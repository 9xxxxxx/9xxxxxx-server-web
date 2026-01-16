import { getAllProjects } from "@/lib/projects";
import Link from "next/link";
import { ArrowRight, Github, ExternalLink } from "lucide-react";

export const metadata = {
  title: "项目展示 | Garry",
  description: "Explore my latest projects and experiments.",
};

export const revalidate = 60;

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div className="min-h-screen pt-24 px-6 max-w-7xl mx-auto pb-16">
      <div className="mb-16 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-foreground">
          项目展示
        </h1>
        <p className="text-muted-foreground text-lg">
          这里汇集了我的一些个人作品、开源项目和实验性代码。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <Link key={project.id} href={`/projects/${project.slug}`} className="group block">
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 h-full flex flex-col">
              <div className="h-48 overflow-hidden relative">
                 <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {project.category && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur text-white text-xs rounded-md border border-white/10">
                        {project.category}
                    </span>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {project.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                    {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                    {project.techStack.slice(0, 3).map(tech => (
                        <span key={tech} className="text-xs px-2 py-1 rounded-md bg-accent/50 text-accent-foreground border border-white/5">
                            {tech}
                        </span>
                    ))}
                    {project.techStack.length > 3 && (
                        <span className="text-xs px-2 py-1 rounded-md bg-accent/20 text-muted-foreground">
                            +{project.techStack.length - 3}
                        </span>
                    )}
                </div>
                
                <div className="flex items-center text-primary text-sm font-medium mt-auto">
                    查看详情 <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
