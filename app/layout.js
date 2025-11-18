import { Playfair_Display, Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import { SmoothScroll } from "@/components/SmoothScroll";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});


const caslonCondensed = {
  variable: "--font-caslon-condensed",
  style: {
    fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif",
  },
};

export const metadata = {
  title: "Online Advisory Business",
  description: "Professional advisory services platform",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      signInUrl="/auth/sign-in"
      signUpUrl="/auth/sign-up"
      afterSignInUrl="/marketplace"
      afterSignUpUrl="/marketplace"
    >
      <html lang="en" className="smooth-scroll">
        <body
          className={`${inter.variable} ${playfair.variable} ${caslonCondensed.variable} antialiased`}
          suppressHydrationWarning={true}
        >
          <SmoothScroll>
            <Header />
            {children}
            <Toaster />
          </SmoothScroll>
        </body>
      </html>
    </ClerkProvider>
  );
}
