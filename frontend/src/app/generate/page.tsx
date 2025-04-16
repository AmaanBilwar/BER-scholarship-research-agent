'use client'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { FileText, Copy, Download, Loader2, ExternalLink } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"

// Define types for our data
interface Sponsor {
  name: string;
  description: string;
  website: string;
}

interface TemplateResponse {
  success: boolean;
  message: string;
  template_path?: string;
  template_content?: string;
  template_paths?: string[];
}

export default function GenerateTemplates() {
  // State for sponsor email template
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [selectedSponsor, setSelectedSponsor] = useState<string>("");
  const [selectedSponsorData, setSelectedSponsorData] = useState<Sponsor | null>(null);
  const [clubDescription, setClubDescription] = useState<string>("");
  const [universityDescription, setUniversityDescription] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userPosition, setUserPosition] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userPhone, setUserPhone] = useState<string>("");
  const [teamWebsite, setTeamWebsite] = useState<string>("");
  const [teamMission, setTeamMission] = useState<string>("");
  const [specificAspect, setSpecificAspect] = useState<string>("");
  const [additionalBenefits, setAdditionalBenefits] = useState<string>("");
  const [generatedTemplate, setGeneratedTemplate] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("email");
  
  // State for essay template
  const [selectedScholarship, setSelectedScholarship] = useState<string>("");
  
  // Scholarship descriptions
  const scholarshipDescriptions: Record<string, string> = {
    "sae": "The SAE International Scholarship supports students participating in Formula SAE competitions. This scholarship recognizes academic excellence, leadership, and innovation in automotive engineering.",
    "automotive": "The Automotive Engineering Excellence Award celebrates outstanding achievements in automotive engineering. Recipients demonstrate exceptional technical skills and a passion for advancing the automotive industry.",
    "leadership": "The Engineering Leadership Scholarship honors students who have shown exceptional leadership within their engineering teams. This scholarship recognizes those who inspire others and drive innovation in engineering projects."
  };

  // Fetch sponsors on component mount
  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/sponsors');
        const data = await response.json();
        
        if (data.success) {
          setSponsors(data.sponsors);
        } else {
          toast.error("Failed to load sponsors");
        }
      } catch (error) {
        console.error("Error fetching sponsors:", error);
        toast.error("Error loading sponsors");
      }
    };

    fetchSponsors();
  }, []);

  // Update selected sponsor data when selection changes
  useEffect(() => {
    if (selectedSponsor && selectedSponsor !== "all") {
      const sponsor = sponsors.find(s => s.name === selectedSponsor);
      setSelectedSponsorData(sponsor || null);
    } else {
      setSelectedSponsorData(null);
    }
  }, [selectedSponsor, sponsors]);

  // Handle template generation
  const handleGenerateTemplate = async () => {
    setIsLoading(true);
    
    try {
      // Prepare the request payload
      const payload = {
        sponsor_name: selectedSponsor === "all" ? "" : selectedSponsor,
        club_description: clubDescription,
        university_description: universityDescription,
        user_name: userName,
        user_position: userPosition,
        user_email: userEmail,
        user_phone: userPhone,
        team_website: teamWebsite,
        team_mission: teamMission,
        specific_aspect: specificAspect,
        additional_benefits: additionalBenefits.split('\n').filter(benefit => benefit.trim() !== ''),
        // Add scholarship information if a scholarship is selected
        scholarship_name: selectedScholarship || "",
        scholarship_description: selectedScholarship ? scholarshipDescriptions[selectedScholarship] : ""
      };

      // Make the API request
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data: TemplateResponse = await response.json();
      
      if (data.success) {
        if (data.template_content) {
          setGeneratedTemplate(data.template_content);
          toast.success("Template generated successfully!");
        } else {
          toast.success(`Generated ${data.template_paths?.length || 0} templates`);
        }
      } else {
        toast.error(data.message || "Failed to generate template");
      }
    } catch (error) {
      console.error("Error generating template:", error);
      toast.error("Error generating template");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle copying template to clipboard
  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(generatedTemplate);
    toast.success("Template copied to clipboard");
  };

  // Handle downloading template
  const handleDownloadTemplate = () => {
    const blob = new Blob([generatedTemplate], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sponsor_email_template_${selectedSponsor || 'all'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Template downloaded");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Generate Templates</h1>
        <p className="text-muted-foreground max-w-2xl">
          Create personalized emails and essays for your scholarship applications.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="email" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email Template</TabsTrigger>
            <TabsTrigger value="essay">Essay Template</TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sponsor Email Template Generator</CardTitle>
                <CardDescription>
                  Create a personalized email to send to potential sponsors.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sponsor">Select Sponsor</Label>
                  <Select value={selectedSponsor} onValueChange={setSelectedSponsor}>
                    <SelectTrigger id="sponsor">
                      <SelectValue placeholder="Select a sponsor (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sponsors</SelectItem>
                      {sponsors.map((sponsor, index) => (
                        <SelectItem key={index} value={sponsor.name}>
                          {sponsor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedSponsorData && (
                  <Card className="mt-4 border border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Sponsor Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        {selectedSponsorData.description}
                      </p>
                      {selectedSponsorData.website && (
                        <div className="flex items-center mt-2">
                          <a 
                            href={selectedSponsorData.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Visit Website
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label htmlFor="clubDescription">Club Description</Label>
                  <Textarea
                    id="clubDescription"
                    placeholder="Describe your Formula Racing team"
                    className="min-h-[100px]"
                    value={clubDescription}
                    onChange={(e) => setClubDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="universityDescription">University Description</Label>
                  <Textarea
                    id="universityDescription"
                    placeholder="Describe the University of Cincinnati"
                    className="min-h-[100px]"
                    value={universityDescription}
                    onChange={(e) => setUniversityDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userName">Your Name</Label>
                  <Input 
                    id="userName" 
                    placeholder="Enter your full name" 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userPosition">Your Position</Label>
                  <Input 
                    id="userPosition" 
                    placeholder="Enter your position in the team" 
                    value={userPosition}
                    onChange={(e) => setUserPosition(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userEmail">Your Email</Label>
                  <Input 
                    id="userEmail" 
                    placeholder="Enter your email address" 
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userPhone">Your Phone</Label>
                  <Input 
                    id="userPhone" 
                    placeholder="Enter your phone number" 
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teamWebsite">Team Website</Label>
                  <Input 
                    id="teamWebsite" 
                    placeholder="Enter your team website" 
                    value={teamWebsite}
                    onChange={(e) => setTeamWebsite(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teamMission">Team Mission</Label>
                  <Input 
                    id="teamMission" 
                    placeholder="Enter your team mission" 
                    value={teamMission}
                    onChange={(e) => setTeamMission(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specificAspect">Specific Aspect</Label>
                  <Input 
                    id="specificAspect" 
                    placeholder="Enter a specific aspect of the company that aligns with your team" 
                    value={specificAspect}
                    onChange={(e) => setSpecificAspect(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalBenefits">Additional Benefits (one per line)</Label>
                  <Textarea
                    id="additionalBenefits"
                    placeholder="Enter additional benefits for the sponsor (one per line)"
                    className="min-h-[100px]"
                    value={additionalBenefits}
                    onChange={(e) => setAdditionalBenefits(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={handleGenerateTemplate}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Email {selectedScholarship ? `for ${selectedScholarship}` : ''}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generated Email</CardTitle>
                <CardDescription>
                  Your personalized email template is ready to use.
                  {selectedScholarship && (
                    <span className="block mt-1 text-primary">
                      This template is tailored for the {selectedScholarship} scholarship.
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  readOnly
                  className="min-h-[300px] font-mono text-sm"
                  value={generatedTemplate || "This doesnt work right now"}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleCopyTemplate} disabled={!generatedTemplate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to Clipboard
                </Button>
                <Button variant="outline" onClick={handleDownloadTemplate} disabled={!generatedTemplate}>
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
                <CardDescription>
                  Create a personalized essay for your scholarship application.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="scholarship">Scholarship</Label>
                  <Select value={selectedScholarship} onValueChange={setSelectedScholarship}>
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
                
                {selectedScholarship && (
                  <Card className="mt-4 border border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Scholarship Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {scholarshipDescriptions[selectedScholarship]}
                      </p>
                    </CardContent>
                  </Card>
                )}

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
                  className="min-h-[300px] font-mono text-sm"
                  value={`Subject: Application for SAE International Scholarship

Dear Scholarship Committee,

I hope this email finds you well. My name is [Your Name], and I am writing to apply for the SAE International Scholarship for students participating in Formula SAE competitions.

I am currently a [Year] student at [University], where I am pursuing a degree in [Major]. For the past [Duration], I have been an active member of our university's FSAE team, serving as [Your Role]. In this role, I have [Brief description of responsibilities and achievements].

Some of my key achievements include:
- [Achievement 1]
- [Achievement 2]
- [Achievement 3]

I am particularly interested in this scholarship because [Reason for interest]. I believe that my experience with FSAE has prepared me well for [Future goals].

Thank you for considering my application.

Best regards,
[Your Name]`}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to Clipboard
                </Button>
                <Button variant="outline">
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

