import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata = {
  title: "BuildBridge — find the right partner to build with",
  description:
    "Find co-founders, manufacturers, marketers, developers, investors, designers, and advisors to build your business with.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BuildBridge",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2563EB",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen pb-20">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <BottomNav />
          </AuthProvider>
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
