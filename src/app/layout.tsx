import type React from "react"
import type { Metadata } from "next"
import {Inter as FontSans} from 'next/font/google'
import { ClerkProvider } from "@clerk/nextjs"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import "./globals.css"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Food AI",
  description: "AI tool for Agrifood",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={cn("bg-background min-h-screen font-sans antialiased", fontSans.variable)}>
          <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}

