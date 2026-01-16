import { prisma } from "@/lib/db";
import { getSiteConfig } from "@/lib/site-config";
import { SettingsForm } from "@/components/dashboard/SettingsForm";

export default async function SettingsPage() {
  const config = await getSiteConfig();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">个人设置</h1>
        <p className="text-muted-foreground mt-1">更新您的网站身份信息</p>
      </div>
      
      <div className="bg-card border border-border rounded-xl p-6">
        <SettingsForm initialConfig={config} />
      </div>
    </div>
  );
}
