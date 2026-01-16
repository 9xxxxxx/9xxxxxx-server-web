import { prisma } from "@/lib/db";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";

export const metadata = {
  title: "Analytics | Dashboard",
};

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  // Fetch raw data (in a real app, you'd aggregate with SQL for performance)
  // For small to medium scale, fetching all and processing in JS or simple aggregation is fine.
  
  // 1. Total Visits
  const totalVisits = await prisma.analyticsEvent.count();
  
  // 2. Visits Last 24h
  const oneDayAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  const visits24h = await prisma.analyticsEvent.count({
    where: {
      createdAt: {
        gte: oneDayAgo,
      },
    },
  });

  // 3. Top Pages (Group By Path) - Prisma doesn't support easy group-by counts in all providers smoothly without raw query or aggregation extension
  // We'll use groupBy
  const topPages = await prisma.analyticsEvent.groupBy({
    by: ['path'],
    _count: {
      path: true,
    },
    orderBy: {
      _count: {
        path: 'desc',
      },
    },
    take: 5,
  });

  // 4. Browsers
  const topBrowsers = await prisma.analyticsEvent.groupBy({
    by: ['browser'],
    _count: {
      browser: true,
    },
    orderBy: {
      _count: {
        browser: 'desc',
      },
    },
    take: 5,
  });
  
  // 5. Daily Visits (Last 7 Days) for Chart
  // We often need raw query for date truncation, or fetch and process. 
  // Retrieving last 7 days events to map in JS is cheap enough for now.
  const sevenDaysAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentEvents = await prisma.analyticsEvent.findMany({
    where: {
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Process for Chart: Group by Day
  const chartData = recentEvents.reduce((acc: Record<string, number>, event: { createdAt: Date }) => {
    const date = event.createdAt.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const formattedChartData = Object.entries(chartData).map(([date, count]) => ({
    date,
    visits: count,
  }));

  // Ensure last 7 days are represented even if 0
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    if (!chartData[dateStr]) {
       formattedChartData.push({ date: dateStr, visits: 0 });
    }
  }
  formattedChartData.sort((a, b) => a.date.localeCompare(b.date));


  return (
    <div className="flex-1 lg:max-w-6xl w-full mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
          Analytics
        </h1>
        <p className="text-slate-500 mt-2">
          Monitor your website traffic and performance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <i className="fa-solid fa-users text-slate-500"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisits}</div>
            <p className="text-xs text-slate-500">All time page views</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 24 Hours</CardTitle>
            <i className="fa-solid fa-clock text-slate-500"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visits24h}</div>
            <p className="text-xs text-slate-500">
               {visits24h > 0 ? "+100%" : "No visits"} from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Traffic Overview</CardTitle>
            <CardDescription>Daily visits for the past 7 days</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <AnalyticsCharts data={formattedChartData} />
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>Most visited paths</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                {topPages.map((page: any, i: number) => (
                    <div key={page.path} className="flex items-center">
                        <div className="w-8 font-mono text-sm text-slate-500">0{i+1}</div>
                        <div className="flex-1 text-sm font-medium truncate" title={page.path}>
                            {page.path}
                        </div>
                        <div className="text-sm font-bold">{page._count.path}</div>
                    </div>
                ))}
                {topPages.length === 0 && (
                    <p className="text-sm text-slate-500">No data available yet.</p>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
