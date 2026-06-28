import { Toaster } from "react-hot-toast";
import { Geist, Geist_Mono, Inter, Noto_Sans_JP } from "next/font/google";
import RsuiteProvider from "../components/RsuiteProvider";
import "rsuite/dist/rsuite.min.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata = {
  title: "Hana System",
  description: "Hana System Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${notoSansJP.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <RsuiteProvider>
          {children}
          <Toaster position="top-center" />
        </RsuiteProvider>
      </body>
    </html>
  );
}
