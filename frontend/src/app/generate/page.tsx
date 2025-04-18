'use client'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
  email?: string;
  phone?: string;
  social_media?: string[];
  contact_page?: string;
  about_page?: string;
  careers_page?: string;
  created_at?: string;
}

interface TemplateResponse {
  success: boolean;
  message: string;
  template_path?: string;
  template_content?: string;
  template_paths?: string[];
}

interface Template {
  sponsor_name: string;
  template_content: string;
  created_at: string;
  user_info: {
    name: string;
    position: string;
    email: string;
    phone: string;
  };
  team_info: {
    website: string;
    mission: string;
  };
  template_info: {
    club_description: string;
    university_description: string;
    specific_aspect: string;
    additional_benefits: string[];
  };
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
  const [isClient, setIsClient] = useState<boolean>(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch sponsors on component mount
  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const response = await fetch('/api/sponsors');
        if (!response.ok) {
          throw new Error('Failed to fetch sponsors');
        }
        const data = await response.json();
        
        if (data.success && Array.isArray(data.sponsors)) {
          console.log("Loaded sponsors:", data.sponsors);
          setSponsors(data.sponsors);
        } else {
          console.error("Invalid data format:", data);
          toast.error("Failed to load sponsors: Invalid data format");
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

  // Add useEffect for fetching templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/templates');
        if (!response.ok) {
          throw new Error('Failed to fetch templates');
        }
        const data = await response.json();
        
        if (data.success && Array.isArray(data.templates)) {
          setTemplates(data.templates);
        } else {
          console.error("Invalid templates data format:", data);
          toast.error("Failed to load templates: Invalid data format");
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
        toast.error("Error loading templates");
      }
    };

    fetchTemplates();
  }, []);

  // Add template selection handler
  const handleTemplateSelect = async (sponsorName: string) => {
    try {
      const response = await fetch(`/api/templates/${encodeURIComponent(sponsorName)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch template');
      }
      const data = await response.json();
      
      if (data.success && data.template) {
        setSelectedTemplate(data.template);
        setSelectedSponsor(data.template.sponsor_name);
        setClubDescription(data.template.template_info.club_description);
        setUniversityDescription(data.template.template_info.university_description);
        setUserName(data.template.user_info.name);
        setUserPosition(data.template.user_info.position);
        setUserEmail(data.template.user_info.email);
        setUserPhone(data.template.user_info.phone);
        setTeamWebsite(data.template.team_info.website);
        setTeamMission(data.template.team_info.mission);
        setSpecificAspect(data.template.template_info.specific_aspect);
        setAdditionalBenefits(data.template.template_info.additional_benefits.join('\n'));
        setGeneratedTemplate(data.template.template_content);
      } else {
        toast.error("Failed to load template data");
      }
    } catch (error) {
      console.error("Error loading template:", error);
      toast.error("Error loading template data");
    }
  };

  // Handle template generation
  const handleGenerateTemplate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sponsor_name: selectedSponsor,
          club_description: clubDescription,
          university_description: universityDescription,
          user_name: userName,
          user_position: userPosition,
          user_email: userEmail,
          user_phone: userPhone,
          team_website: teamWebsite,
          team_mission: teamMission,
          specific_aspect: specificAspect,
          additional_benefits: additionalBenefits.split('\n').filter(b => b.trim()),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404 && data.message.includes('No sponsors found')) {
          toast.error('No sponsors found in the database. Please run the scraper first to collect sponsor data.');
        } else {
          toast.error(data.message || 'Failed to generate template');
        }
        return;
      }

      if (data.success) {
        if (data.template_content) {
          // Single template generated
          setGeneratedTemplate(data.template_content);
          toast.success(`Template generated and saved for ${selectedSponsor}`);
        } else if (data.template_paths) {
          // Multiple templates generated
          const count = Object.keys(data.template_paths).length;
          toast.success(`Generated and saved ${count} templates successfully`);
        } else {
          toast.success('Template generated and saved successfully');
        }
      } else {
        toast.error(data.message || 'Failed to generate template');
      }
    } catch (error) {
      console.error('Error generating template:', error);
      toast.error('Failed to generate template. Please try again.');
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

  // If not client-side yet, show a loading state to prevent hydration errors
  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Generate Templates</h1>
        <p className="text-muted-foreground max-w-2xl">
          Create personalized emails for your scholarship applications.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
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
                  {sponsors && sponsors.length > 0 ? (
                    sponsors.map((sponsor, index) => (
                      <SelectItem key={index} value={sponsor.name}>
                        {sponsor.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>Loading sponsors...</SelectItem>
                  )}
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
                  {selectedSponsorData.created_at && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Added: {new Date(selectedSponsorData.created_at).toLocaleDateString()}
                    </p>
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
                  Generate Email
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
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              className="min-h-[300px] font-mono text-sm"
              value={generatedTemplate || "No template generated yet. Fill in the form above and click 'Generate Email'."}
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

        {/* Template History Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Template History</CardTitle>
            <CardDescription>
              View and load previously generated templates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {templates.length > 0 ? (
                templates.map((template, index) => (
                  <Card 
                    key={index} 
                    className={`cursor-pointer hover:bg-accent/50 transition-colors ${
                      selectedTemplate?.sponsor_name === template.sponsor_name ? 'border-primary' : ''
                    }`}
                    onClick={() => handleTemplateSelect(template.sponsor_name)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{template.sponsor_name}</CardTitle>
                      <CardDescription>
                        Created on {new Date(template.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.template_content}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground">No templates generated yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

