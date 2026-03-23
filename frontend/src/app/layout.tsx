import type { Metadata, Viewport } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "CollectHub - Baseball Card Auto-Crop",
  description:
    "Auto-crop and orient your baseball card images for PSA Set Registry and Fanatics Vault.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CollectHub",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f0b2e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <NavBar />
          <div className="pt-14">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
