import { fetchAPI } from "@/lib/api-client";

export type SiteConfig = {
  id: string;
  ownerName: string;
  avatarInitial: string;
  avatarGradient: string;
  avatarImage: string | null;
  siteTitle: string | null;
  availableCategories: string[];
  updatedAt: Date;
};

export async function getSiteConfig() {
  try {
    return await fetchAPI<SiteConfig>("/api/site-config");
  } catch (error) {
    // Fallback if API fails (e.g. build time without server running)
    // or return default values that match backend defaults
    return {
      ownerName: "Garry",
      avatarInitial: "G",
      avatarGradient: "from-blue-600 to-indigo-600",
      siteTitle: "Portfolio",
      id: "default",
      avatarImage: null,
      availableCategories: ["Tech", "Design", "Life"],
      updatedAt: new Date(),
    };
  }
}
