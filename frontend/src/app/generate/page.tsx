import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { FileText, Copy, Download } from "lucide-react"

export default function GenerateTemplates() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Generate Templates</h1>
        <p className="text-muted-foreground max-w-2xl">
          Create personalized emails and essays for your scholarship applications.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="email" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email Template</TabsTrigger>
            <TabsTrigger value="essay">Essay Template</TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Template Generator</CardTitle>
                <CardDescription>
                  Create a personalized email to send with your scholarship application.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="scholarship">Scholarship</Label>
                  <Select>
                    <SelectTrigger id="scholarship">
                      <SelectValue placeholder="Select a scholarship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sae">SAE International Scholarship</SelectItem>
                      <SelectItem value="automotive">Automotive Engineering Excellence Award</SelectItem>
                      <SelectItem value="leadership">Engineering Leadership Scholarship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input id="name" placeholder="Enter your full name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">FSAE Experience</Label>
                  <Textarea
                    id="experience"
                    placeholder="Briefly describe your FSAE experience and role"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="achievements">Key Achievements</Label>
                  <Textarea
                    id="achievements"
                    placeholder="List your key achievements relevant to this scholarship"
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Email
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generated Email</CardTitle>
                <CardDescription>Your personalized email template is ready to use.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  readOnly
                  className="min-h-[300px] font-mono text-sm"
                  value={`Subject: Application for SAE International Scholarship

Dear Scholarship Committee,

I hope this email finds you well. My name is [Your Name], and I am writing to apply for the SAE International Scholarship for students participating in Formula SAE competitions.

I am currently a [Year] student at [University], where I am pursuing a degree in [Major]. For the past [Duration], I have been an active member of our university's FSAE team, serving as [Your Role]. In this role, I have [Brief description of responsibilities and achievements].

Some of my key achievements include:
- [Achievement 1]
- [Achievement 2]
- [Achievement 3]

I am particularly passionate about [Specific area of interest], and I believe that receiving this scholarship would greatly support my educational and career goals in the automotive engineering field.

Attached to this email, you will find my completed application form, resume, and academic transcripts as required. I would be happy to provide any additional information or documentation that may be needed for my application.

Thank you for considering my application. I look forward to the opportunity to further discuss how my experience and goals align with the values of the SAE International Scholarship.

Sincerely,
[Your Name]
[Contact Information]`}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to Clipboard
                </Button>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="essay" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Essay Template Generator</CardTitle>
                <CardDescription>Create a personalized essay for your scholarship application.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="essay-scholarship">Scholarship</Label>
                  <Select>
                    <SelectTrigger id="essay-scholarship">
                      <SelectValue placeholder="Select a scholarship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sae">SAE International Scholarship</SelectItem>
                      <SelectItem value="automotive">Automotive Engineering Excellence Award</SelectItem>
                      <SelectItem value="leadership">Engineering Leadership Scholarship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="essay-prompt">Essay Prompt</Label>
                  <Input id="essay-prompt" placeholder="Enter the essay prompt or question" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="essay-experience">FSAE Experience</Label>
                  <Textarea
                    id="essay-experience"
                    placeholder="Describe your FSAE experience in detail"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="essay-achievements">Key Achievements</Label>
                  <Textarea
                    id="essay-achievements"
                    placeholder="List your key achievements relevant to this scholarship"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="essay-goals">Career Goals</Label>
                  <Textarea
                    id="essay-goals"
                    placeholder="Describe your career goals and how this scholarship will help"
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Essay
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generated Essay</CardTitle>
                <CardDescription>Your personalized essay template is ready to use.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  readOnly
                  className="min-h-[400px] font-mono text-sm"
                  value={`The Impact of Formula SAE on My Engineering Journey

My journey in engineering began with a simple fascination with how things work. As a child, I would disassemble toys and household appliances, eager to understand their inner workings. This curiosity evolved into a passion for automotive engineering when I joined my university's Formula SAE team during my freshman year.

Formula SAE has been more than just an extracurricular activity for me—it has been a transformative experience that has shaped my academic path and professional aspirations. As [Your Role] on our team, I have had the opportunity to [specific responsibilities and experiences]. This hands-on experience has complemented my classroom learning in ways I never anticipated, allowing me to apply theoretical concepts to real-world engineering challenges.

One of the most significant projects I contributed to was [specific project], where I [your contribution and its impact]. This experience taught me valuable lessons about [lessons learned], which I believe are essential skills for any engineer. The project resulted in [outcomes or achievements], demonstrating the practical impact of our team's collaborative efforts.

Beyond technical skills, Formula SAE has cultivated my leadership abilities and teamwork. When faced with [specific challenge], I [how you addressed it], which resulted in [positive outcome]. This experience taught me that engineering is not just about technical solutions but also about effective communication and collaboration.

My involvement in Formula SAE has solidified my career goal of [specific career goal]. I am particularly interested in [specific area of interest] because [reason for interest]. Receiving this scholarship would enable me to [how the scholarship would help], bringing me one step closer to achieving my professional aspirations in the automotive engineering field.

In conclusion, Formula SAE has been the cornerstone of my engineering education, providing me with technical knowledge, practical experience, and professional skills that extend far beyond the classroom. I am committed to continuing this journey of growth and innovation, and I believe that with the support of this scholarship, I can make meaningful contributions to the field of automotive engineering.`}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to Clipboard
                </Button>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

