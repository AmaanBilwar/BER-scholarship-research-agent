'use client';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, BookmarkPlus, ExternalLink, Loader2, ArrowUpDown } from "lucide-react"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Sponsor {
  name: string;
  website: string;
  description: string;
  email?: string;
  phone?: string;
  social_media?: string[];
  contact_page?: string;
  about_page?: string;
  careers_page?: string;
  search_query?: string;
  created_at?: string;
  fit_analysis?: {
    score: number;
    reasons: string[];
  };
}

type SortOrder = 'highest' | 'lowest' | 'none';

export default function FindScholarships() {
  const [isScraping, setIsScraping] = useState(false);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');

  // Function to fetch sponsors from MongoDB
  const fetchSponsors = async () => {
    try {
      const response = await fetch('/api/sponsors');
      if (!response.ok) {
        throw new Error('Failed to fetch sponsors');
      }
      const data = await response.json();
      
      if (data.success) {
        // Add fit analysis if it doesn't exist
        const sponsorsWithAnalysis = data.sponsors.map((sponsor: any) => {
          if (!sponsor.fit_analysis) {
            // Create a simple fit analysis based on available data
            const score = Math.floor(Math.random() * 100); // Placeholder score
            const reasons = [];
            
            if (sponsor.description?.toLowerCase().includes('automotive')) {
              reasons.push('Automotive industry');
            }
            if (sponsor.description?.toLowerCase().includes('engineering')) {
              reasons.push('Engineering focus');
            }
            if (sponsor.careers_page) {
              reasons.push('Has careers page');
            }
            if (sponsor.social_media?.length) {
              reasons.push('Active on social media');
            }
            
            return {
              ...sponsor,
              fit_analysis: {
                score,
                reasons: reasons.length > 0 ? reasons : ['Potential sponsor']
              }
            };
          }
          return sponsor;
        });
        
        setSponsors(sponsorsWithAnalysis);
      } else {
        throw new Error(data.message || 'Failed to fetch sponsors');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching sponsors');
    }
  };

  // Fetch sponsors when component mounts
  useEffect(() => {
    fetchSponsors();
  }, []);

  const startScraping = async () => {
    setIsScraping(true);
    setError(null);
    try {
      const response = await fetch('/api/scraper', {
        method: 'GET',
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to scrape sponsors');
      }
      
      // After successful scraping, fetch the updated sponsors
      await fetchSponsors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while scraping');
    } finally {
      setIsScraping(false);
    }
  };

  const getSortedSponsors = () => {
    if (sortOrder === 'none') return sponsors;
    
    return [...sponsors].sort((a, b) => {
      const scoreA = a.fit_analysis?.score ?? 0;
      const scoreB = b.fit_analysis?.score ?? 0;
      return sortOrder === 'highest' ? scoreB - scoreA : scoreA - scoreB;
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Find Sponsors</h1>
        <p className="text-muted-foreground max-w-2xl">
          Search for potential sponsors using our AI-powered web scraping technology :)
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Button 
            onClick={startScraping} 
            disabled={isScraping}
            className="w-48"
          >
            {isScraping ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scraping in progress...
              </>
            ) : (
              'Start Scraping'
            )}
          </Button>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <Select value={sortOrder} onValueChange={(value: SortOrder) => setSortOrder(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No sorting</SelectItem>
                <SelectItem value="highest">Highest score first</SelectItem>
                <SelectItem value="lowest">Lowest score first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {getSortedSponsors().map((sponsor, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{sponsor.name}</CardTitle>
                    <CardDescription>{sponsor.description}</CardDescription>
                  </div>
                  <Badge>Score: {sponsor.fit_analysis?.score || 'N/A'}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {sponsor.fit_analysis?.reasons.map((reason, idx) => (
                    <Badge key={idx} variant="outline">{reason}</Badge>
                  ))}
                </div>
                {sponsor.email && (
                  <p className="text-sm text-muted-foreground">Email: {sponsor.email}</p>
                )}
                {sponsor.phone && (
                  <p className="text-sm text-muted-foreground">Phone: {sponsor.phone}</p>
                )}
                {sponsor.created_at && (
                  <p className="text-sm text-muted-foreground">
                    Added: {new Date(sponsor.created_at).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  <BookmarkPlus className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button size="sm" asChild>
                  <a href={sponsor.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Website
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

