import { ThemeProvider } from "@/ThemeProvider";
import { AuthProvider } from "@/AuthProvider";
import ServiceWorkerRegister from "@/ServiceWorkerRegister";
import "../globals.css";

export const metadata = {
  title: "BuildBridge - Find Your Co-Founder",
  description: "A premium, mobile-first app to find the right partner to build a business with",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0F172A",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" href="/icon-192.png" />
      </head>
      <body className="bg-white dark:bg-slate-950">
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
