"use client";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, FileText, Calendar, DollarSign, CheckCircle, XCircle, Clock, Search } from "lucide-react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"

// Define types for our scholarship data
type ScholarshipStatus = "saved" | "applied" | "rejected" | "waiting";

interface Scholarship {
  id: string;
  name: string;
  website: string;
  description: string;
  status: ScholarshipStatus;
  deadline?: string;
  amount?: string;
  appliedDate?: string;
}

// Local storage key for saving scholarship states
const SCHOLARSHIP_STORAGE_KEY = 'scholarship-states';

export default function TrackScholarships() {
  // State to store all scholarships
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  // State for search query
  const [searchQuery, setSearchQuery] = useState("");
  
  // Load scholarships from potential_sponsors.json on component mount
  useEffect(() => {
    const loadScholarships = async () => {
      try {
        // First, try to load saved states from localStorage
        const savedStates = localStorage.getItem(SCHOLARSHIP_STORAGE_KEY);
        const savedStatesObj = savedStates ? JSON.parse(savedStates) : {};
        
        // Then fetch the scholarship data
        const response = await fetch('/api/scholarships');
        if (!response.ok) {
          throw new Error('Failed to fetch scholarships');
        }
        const data = await response.json();
        
        // Ensure data is an array
        if (!Array.isArray(data)) {
          console.error('Expected array of scholarships, got:', typeof data);
          return;
        }
        
        // Transform the data to include status
        const transformedData = data.map((item: any, index: number) => {
          const id = `scholarship-${index}`;
          // Use saved state if available, otherwise default to "saved"
          const savedState = savedStatesObj[id];
          
          return {
            id,
            name: item.name || 'Unnamed Scholarship',
            website: item.website || '#',
            description: item.description || 'No description available',
            status: savedState?.status || "saved" as ScholarshipStatus,
            deadline: item.deadline || "Not specified",
            amount: item.amount || "Not specified",
            appliedDate: savedState?.appliedDate || undefined
          };
        });
        
        setScholarships(transformedData);
      } catch (error) {
        console.error("Failed to load scholarships:", error);
        // Set empty array to prevent undefined errors
        setScholarships([]);
      }
    };
    
    loadScholarships();
  }, []);
  
  // Save scholarship states to localStorage whenever they change
  useEffect(() => {
    if (scholarships.length > 0) {
      const statesToSave = scholarships.reduce((acc, scholarship) => {
        acc[scholarship.id] = {
          status: scholarship.status,
          appliedDate: scholarship.appliedDate
        };
        return acc;
      }, {} as Record<string, { status: ScholarshipStatus; appliedDate?: string }>);
      
      localStorage.setItem(SCHOLARSHIP_STORAGE_KEY, JSON.stringify(statesToSave));
    }
  }, [scholarships]);
  
  // Function to update scholarship status
  const updateScholarshipStatus = (id: string, newStatus: ScholarshipStatus) => {
    setScholarships(prevScholarships => 
      prevScholarships.map(scholarship => 
        scholarship.id === id 
          ? { 
              ...scholarship, 
              status: newStatus,
              appliedDate: newStatus === "applied" ? new Date().toLocaleDateString() : scholarship.appliedDate
            } 
          : scholarship
      )
    );
  };
  
  // Function to filter scholarships by search query
  const filterScholarshipsBySearch = (scholarships: Scholarship[]) => {
    if (!searchQuery.trim()) return scholarships;
    
    const query = searchQuery.toLowerCase();
    return scholarships.filter(scholarship => 
      scholarship.name.toLowerCase().includes(query) || 
      scholarship.description.toLowerCase().includes(query)
    );
  };
  
  // Filter scholarships by status and search query
  const getScholarshipsByStatus = (status: ScholarshipStatus | "all") => {
    let filteredScholarships = scholarships;
    
    // First filter by status
    if (status !== "all") {
      filteredScholarships = scholarships.filter(scholarship => scholarship.status === status);
    }
    
    // Then filter by search query
    return filterScholarshipsBySearch(filteredScholarships);
  };
  
  // Render scholarship card
  const renderScholarshipCard = (scholarship: Scholarship) => {
    const getStatusBadge = () => {
      switch (scholarship.status) {
        case "applied":
          return <Badge>Applied</Badge>;
        case "rejected":
          return <Badge variant="destructive">Rejected</Badge>;
        case "waiting":
          return <Badge variant="outline">Waiting</Badge>;
        default:
          return <Badge variant="outline">Saved</Badge>;
      }
    };
    
    const getActionButtons = () => {
      switch (scholarship.status) {
        case "saved":
          return (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => updateScholarshipStatus(scholarship.id, "applied")}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Apply Now
              </Button>
              <Button 
                size="sm"
                onClick={() => window.open(scholarship.website, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Website
              </Button>
            </>
          );
        case "applied":
          return (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => updateScholarshipStatus(scholarship.id, "waiting")}
              >
                <Clock className="h-4 w-4 mr-2" />
                Waiting
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => updateScholarshipStatus(scholarship.id, "rejected")}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejected
              </Button>
            </>
          );
        case "waiting":
          return (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => updateScholarshipStatus(scholarship.id, "rejected")}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejected
              </Button>
              <Button 
                size="sm"
                onClick={() => window.open(scholarship.website, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Website
              </Button>
            </>
          );
        case "rejected":
          return (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => updateScholarshipStatus(scholarship.id, "saved")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Save Again
              </Button>
              <Button 
                size="sm"
                onClick={() => window.open(scholarship.website, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Website
              </Button>
            </>
          );
        default:
          return null;
      }
    };
    
    return (
      <Card key={scholarship.id}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{scholarship.name}</CardTitle>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{scholarship.description}</p>
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Deadline: {scholarship.deadline}</span>
          </div>
          {scholarship.appliedDate && (
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Applied: {scholarship.appliedDate}</span>
            </div>
          )}
          <div className="flex items-center text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4 mr-1" />
            <span>Amount: {scholarship.amount}</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          {getActionButtons()}
        </CardFooter>
      </Card>
    );
  };

  // Render empty state message
  const renderEmptyState = (status: string) => {
    return (
      <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-1">No {status} scholarships</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          {searchQuery 
            ? `No scholarships match your search "${searchQuery}". Try a different search term.`
            : `You don't have any ${status.toLowerCase()} scholarships yet.`}
        </p>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Track Applications</h1>
        <p className="text-muted-foreground max-w-2xl">Keep track of all your scholarship applications in one place.</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Search input */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search scholarships..."
            className="pl-10"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">
              All ({scholarships.length})
            </TabsTrigger>
            <TabsTrigger value="applied">
              Applied ({scholarships.filter(s => s.status === "applied").length})
            </TabsTrigger>
            <TabsTrigger value="waiting">
              Waiting ({scholarships.filter(s => s.status === "waiting").length})
            </TabsTrigger>
            <TabsTrigger value="saved">
              Saved ({scholarships.filter(s => s.status === "saved").length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({scholarships.filter(s => s.status === "rejected").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getScholarshipsByStatus("all").length > 0 
                ? getScholarshipsByStatus("all").map(renderScholarshipCard)
                : renderEmptyState("All")}
            </div>
          </TabsContent>

          <TabsContent value="applied" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getScholarshipsByStatus("applied").length > 0 
                ? getScholarshipsByStatus("applied").map(renderScholarshipCard)
                : renderEmptyState("Applied")}
            </div>
          </TabsContent>

          <TabsContent value="waiting" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getScholarshipsByStatus("waiting").length > 0 
                ? getScholarshipsByStatus("waiting").map(renderScholarshipCard)
                : renderEmptyState("Waiting")}
            </div>
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getScholarshipsByStatus("saved").length > 0 
                ? getScholarshipsByStatus("saved").map(renderScholarshipCard)
                : renderEmptyState("Saved")}
            </div>
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getScholarshipsByStatus("rejected").length > 0 
                ? getScholarshipsByStatus("rejected").map(renderScholarshipCard)
                : renderEmptyState("Rejected")}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

