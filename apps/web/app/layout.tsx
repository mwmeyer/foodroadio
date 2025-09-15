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
        <title>FoodRoadio</title>
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
