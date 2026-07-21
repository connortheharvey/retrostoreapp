import "./globals.css";

export const metadata = {
  title: "RetroStorePortal — Find & Review Retro Game Stores",
  description: "Discover and review local retro video game stores — arcades, cartridge shops, and repair counters near you.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="crt-overlay" aria-hidden="true"></div>
        {children}
      </body>
    </html>
  );
}
