import "./globals.css";
import { ThemeProvider } from "@/ThemeProvider";
import { AuthProvider } from "@/AuthProvider";
import BottomNav from "@/BottomNav";
import ServiceWorkerRegister from "@/ServiceWorkerRegister";
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
