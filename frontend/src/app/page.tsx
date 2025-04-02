import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, FileText, BookmarkCheck } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">FSAE Scholarship Finder</h1>
        <p className="text-muted-foreground max-w-2xl">
          Find, apply, and track scholarships tailored for FSAE students using advanced AI technology.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <Card className="flex flex-col">
          <CardHeader>
            <Search className="h-8 w-8 mb-2" />
            <CardTitle>Find Scholarships</CardTitle>
            <CardDescription>
              Discover scholarships by leveraging our AI-powered web scraping technology.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">
              Our system searches across multiple sources to find the most relevant scholarships for FSAE students.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/find" className="w-full">
              <Button className="w-full">Find Scholarships</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <FileText className="h-8 w-8 mb-2" />
            <CardTitle>Generate Templates</CardTitle>
            <CardDescription>Create personalized emails and essays for scholarship applications.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">
              Use our AI to generate customized templates that highlight your skills and experiences.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/generate" className="w-full">
              <Button className="w-full">Generate Templates</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <BookmarkCheck className="h-8 w-8 mb-2" />
            <CardTitle>Track Applications</CardTitle>
            <CardDescription>Manage and track all your scholarship applications in one place.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">
              Keep track of applied, saved, and rejected scholarships with our intuitive tracking system.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/track" className="w-full">
              <Button className="w-full">Track Scholarships</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

