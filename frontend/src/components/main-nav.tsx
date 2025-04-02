"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Search, FileText, BookmarkCheck, Home } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link
        href="/"
        className={cn(
          "flex items-center text-sm font-medium transition-colors hover:text-primary",
          pathname === "/" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <Home className="h-4 w-4 mr-2" />
        Home
      </Link>
      <Link
        href="/find"
        className={cn(
          "flex items-center text-sm font-medium transition-colors hover:text-primary",
          pathname === "/find" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <Search className="h-4 w-4 mr-2" />
        Find Scholarships
      </Link>
      <Link
        href="/generate"
        className={cn(
          "flex items-center text-sm font-medium transition-colors hover:text-primary",
          pathname === "/generate" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <FileText className="h-4 w-4 mr-2" />
        Generate Templates
      </Link>
      <Link
        href="/track"
        className={cn(
          "flex items-center text-sm font-medium transition-colors hover:text-primary",
          pathname === "/track" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <BookmarkCheck className="h-4 w-4 mr-2" />
        Track Applications
      </Link>
    </nav>
  )
}

