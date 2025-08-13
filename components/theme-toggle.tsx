"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative overflow-hidden transition-all duration-500 hover:scale-110 active:scale-95 bg-background/80 backdrop-blur-sm border-border/50 hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10 shadow-lg hover:shadow-xl"
    >
      <Sun
        className={`h-[1.2rem] w-[1.2rem] transition-all duration-500 ease-in-out ${
          theme === "dark" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
      />
      <Moon
        className={`absolute h-[1.2rem] w-[1.2rem] transition-all duration-500 ease-in-out ${
          theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        }`}
      />

      <div
        className={`absolute inset-0 rounded-md transition-all duration-500 ${
          theme === "dark"
            ? "bg-gradient-to-br from-blue-500/10 to-purple-500/10"
            : "bg-gradient-to-br from-yellow-500/10 to-orange-500/10"
        }`}
      />

      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
