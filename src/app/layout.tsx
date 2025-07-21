import type { Metadata } from "next";
import Navigation from "@/components/ui/Navigation";
import { FlashMessageProvider } from "@/components/ui/FlashMessageProvider";
import FlashMessages from "@/components/ui/FlashMessages";
import "./globals.css";

export const metadata: Metadata = {
  title: "图像处理工具",
  description: "图像处理工具集合 - 双图合并、多图合并、图标制作和文件对比",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Bootstrap 5 CSS CDN */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM"
          crossOrigin="anonymous"
        />
        {/* Bootstrap 5 JS CDN */}
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz"
          crossOrigin="anonymous"
          async
        />
      </head>
      <body>
        <FlashMessageProvider>
          <div className="container-fluid">
            <Navigation />
            <FlashMessages />
            {children}
          </div>
        </FlashMessageProvider>
      </body>
    </html>
  );
}
