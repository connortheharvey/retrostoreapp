import "./globals.css";

export const metadata = {
  title: "RetroFind — Discover Retro Game Stores",
  description: "Find and review retro video game stores near you — arcades, cartridge shops, and repair counters.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bungee&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="grain-overlay" aria-hidden="true"></div>
        {children}
      </body>
    </html>
  );
}
