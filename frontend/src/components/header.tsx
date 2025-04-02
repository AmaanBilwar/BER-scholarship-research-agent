import Link from "next/link"
import { MainNav } from "../components/main-nav"
import { ModeToggle } from '../components/mode-toggle'
import { UserButton } from "../components/user-button"

export function Header() {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 sm:px-6">
        <Link href="/" className="font-bold text-xl mr-6">
          FSAE Scholarships
        </Link>
        <MainNav />
        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle />
          <UserButton />
        </div>
      </div>
    </header>
  )
}

