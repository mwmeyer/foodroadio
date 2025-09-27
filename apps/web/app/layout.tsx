import { Inter } from "next/font/google";
import "../styles/global.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>FoodRoadio - Find Food Trucks & Events</title>
        <meta
          name="description"
          content="Turn your culinary space into a gathering place! Discover amazing food trucks and the exciting events they host - from cooking classes to live music nights."
        />
      </head>
      <body
        className={`${inter.className} bg-gray-900`}
        style={{ overflow: "hidden" }}
      >
        {children}
      </body>
    </html>
  );
}
