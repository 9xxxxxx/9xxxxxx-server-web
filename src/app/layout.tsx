import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Garry-9xxxxxx",
  description: "Built with Next.js and Tailwind CSS",
};

import { Footer } from "@/components/Footer";
import { GlobalBackground } from "@/components/GlobalBackground";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { CommandMenu } from "@/components/CommandMenu";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`font-sans antialiased bg-transparent text-foreground transition-colors duration-300 min-h-screen flex flex-col relative selection:bg-indigo-100 selection:text-indigo-900`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Global Dynamic Background */}
          <GlobalBackground />
          <CommandMenu />
          
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>

          <main className="flex-1 w-full relative z-10">
            {children}
          </main>
          
          <ScrollToTop />
          <Toaster position="top-center" richColors />
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}