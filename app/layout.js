import { ThemeProvider } from "@/ThemeProvider";
import { AuthProvider } from "@/AuthProvider";
import ServiceWorkerRegister from "@/ServiceWorkerRegister";
import "../globals.css";

export const metadata = {
  title: "BuildBridge - Find Your Co-Founder | Premium Venture Platform",
  description: "Join the elite community of founders, builders, and investors. Find your perfect co-founder to build legendary ventures.",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#78350f",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" href="/icon-192.png" />
        <meta name="theme-color" content="#78350f" media="(prefers-color-scheme: dark)" />
      </head>
      <body className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-[#0a0d12]">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <ServiceWorkerRegister />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
