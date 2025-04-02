import { Button } from "@/components/ui/button"
import { Input } from "@/components/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, BookmarkPlus, ExternalLink } from "lucide-react"

export default function FindScholarships() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Find Scholarships</h1>
        <p className="text-muted-foreground max-w-2xl">
          Search for scholarships using our AI-powered web scraping technology.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex gap-2 mb-8">
          <Input placeholder="Search for scholarships (e.g., 'automotive engineering', 'FSAE')" className="flex-1" />
          <Button>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="engineering">Engineering</TabsTrigger>
            <TabsTrigger value="automotive">Automotive</TabsTrigger>
            <TabsTrigger value="leadership">Leadership</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          {/* Sample scholarship cards */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>SAE International Scholarship</CardTitle>
                  <CardDescription>For students participating in Formula SAE competitions</CardDescription>
                </div>
                <Badge>$5,000</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                This scholarship is awarded to undergraduate students who demonstrate exceptional skills in automotive
                engineering and are active participants in Formula SAE competitions.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Engineering</Badge>
                <Badge variant="outline">Automotive</Badge>
                <Badge variant="outline">Competition</Badge>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">
                <BookmarkPlus className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Automotive Engineering Excellence Award</CardTitle>
                  <CardDescription>For outstanding automotive design projects</CardDescription>
                </div>
                <Badge>$3,500</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                This scholarship recognizes students who have demonstrated excellence in automotive design projects,
                with preference given to those involved in FSAE competitions.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Design</Badge>
                <Badge variant="outline">Automotive</Badge>
                <Badge variant="outline">Innovation</Badge>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">
                <BookmarkPlus className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Engineering Leadership Scholarship</CardTitle>
                  <CardDescription>For student leaders in engineering projects</CardDescription>
                </div>
                <Badge>$2,500</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                This scholarship is awarded to students who have demonstrated leadership skills in engineering projects,
                particularly in team-based competitions like FSAE.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Leadership</Badge>
                <Badge variant="outline">Engineering</Badge>
                <Badge variant="outline">Teamwork</Badge>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">
                <BookmarkPlus className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

