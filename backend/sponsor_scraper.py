import requests
import json
import os
import time
import re
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()

# Load environment variables
SCRAPER_API_KEY = os.getenv("SERPER_API_KEY")
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"

def search_potential_sponsors():
    """
    Search for companies that might sponsor a Formula SAE electric racecar team.
    Returns a list of potential sponsors with relevant information.
    """
    # Search queries that might help find potential sponsors
    search_queries = [
        "companies that sponsor formula student teams",
        "automotive companies that sponsor racing teams",
        "electric vehicle companies that sponsor racing",
        "engineering companies that sponsor student competitions",
        "companies that sponsor university racing teams",
        "automotive parts manufacturers that sponsor racing",
        "battery companies that sponsor electric racing",
        "companies that sponsor sustainable racing initiatives",
        "companies that sponsor formula sae electric teams",
        "companies that sponsor student engineering projects"
    ]
    
    all_results = []
    
    for query in search_queries:
        print(f"Searching for: {query}")
        results = perform_search(query)
        
        if results and "organic" in results:
            for result in results["organic"]:
                # Extract relevant information
                sponsor_info = {
                    "name": result.get("title", "").split(" - ")[0].strip(),
                    "website": result.get("link", ""),
                    "description": result.get("snippet", ""),
                    "search_query": query
                }
                
                # Only add if it's not already in our results
                if not any(r["name"] == sponsor_info["name"] for r in all_results):
                    # Try to extract contact information from the website
                    if sponsor_info["website"]:
                        try:
                            contact_info = extract_contact_info(sponsor_info["website"])
                            sponsor_info.update(contact_info)
                        except Exception as e:
                            print(f"Error extracting contact info from {sponsor_info['website']}: {e}")
                    
                    all_results.append(sponsor_info)
        
        # Be nice to the API
        time.sleep(1)
    
    # Save results to a file
    save_results(all_results)
    
    return all_results

def perform_search(search_term):
    """
    Perform a search using the Serper API.
    """
    url = "https://google.serper.dev/search"
    payload = {"q": search_term}
    headers = {"X-API-KEY": SCRAPER_API_KEY, "Content-Type": "application/json"}
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()  # Raise an exception for HTTP errors
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error performing search: {e}")
        return None

def extract_contact_info(url):
    """
    Extract contact information from a company website.
    """
    headers = {"User-Agent": USER_AGENT}
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Initialize contact info dictionary
        contact_info = {
            "email": None,
            "phone": None,
            "contact_page": None,
            "about_page": None,
            "careers_page": None,
            "social_media": []
        }
        
        # Find contact page link
        contact_links = soup.find_all('a', href=True, text=re.compile(r'contact|reach|get in touch', re.I))
        if contact_links:
            contact_link = contact_links[0]['href']
            if not contact_link.startswith('http'):
                # Handle relative URLs
                parsed_url = urlparse(url)
                base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
                contact_link = base_url + ('' if contact_link.startswith('/') else '/') + contact_link
            contact_info["contact_page"] = contact_link
        
        # Find about page link
        about_links = soup.find_all('a', href=True, text=re.compile(r'about|about us|our story', re.I))
        if about_links:
            about_link = about_links[0]['href']
            if not about_link.startswith('http'):
                parsed_url = urlparse(url)
                base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
                about_link = base_url + ('' if about_link.startswith('/') else '/') + about_link
            contact_info["about_page"] = about_link
        
        # Find careers page link
        careers_links = soup.find_all('a', href=True, text=re.compile(r'careers|jobs|join us|work with us', re.I))
        if careers_links:
            careers_link = careers_links[0]['href']
            if not careers_link.startswith('http'):
                parsed_url = urlparse(url)
                base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
                careers_link = base_url + ('' if careers_link.startswith('/') else '/') + careers_link
            contact_info["careers_page"] = careers_link
        
        # Find email addresses
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        emails = re.findall(email_pattern, response.text)
        if emails:
            contact_info["email"] = emails[0]  # Just take the first email
        
        # Find phone numbers
        phone_pattern = r'(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        phones = re.findall(phone_pattern, response.text)
        if phones:
            contact_info["phone"] = phones[0]  # Just take the first phone number
        
        # Find social media links
        social_patterns = [
            r'https?://(?:www\.)?facebook\.com/[a-zA-Z0-9.]+',
            r'https?://(?:www\.)?twitter\.com/[a-zA-Z0-9.]+',
            r'https?://(?:www\.)?linkedin\.com/(?:company|in)/[a-zA-Z0-9-]+',
            r'https?://(?:www\.)?instagram\.com/[a-zA-Z0-9.]+'
        ]
        
        for pattern in social_patterns:
            social_links = re.findall(pattern, response.text)
            if social_links:
                contact_info["social_media"].extend(social_links)
        
        return contact_info
    
    except Exception as e:
        print(f"Error extracting contact info: {e}")
        return {}

def save_results(results):
    """
    Save the results to a JSON file.
    """
    output_dir = "data"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    output_file = os.path.join(output_dir, "potential_sponsors.json")
    
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    
    print(f"Saved {len(results)} potential sponsors to {output_file}")

def analyze_sponsor_fit(sponsor):
    """
    Analyze how well a potential sponsor might fit with a Formula SAE electric team.
    Returns a score from 0-100 and reasons.
    """
    score = 0
    reasons = []
    
    # Check if the company is in the automotive or engineering sector
    keywords = ["automotive", "engineering", "racing", "electric", "vehicle", "battery", 
                "technology", "innovation", "sustainable", "green", "energy"]
    
    description = sponsor.get("description", "").lower()
    for keyword in keywords:
        if keyword in description:
            score += 5
            reasons.append(f"Company is related to {keyword}")
    
    # Check if they have a careers page (might be more open to partnerships)
    if sponsor.get("careers_page"):
        score += 10
        reasons.append("Company has a careers page, indicating they invest in talent")
    
    # Check if they have social media presence
    if sponsor.get("social_media"):
        score += 5
        reasons.append("Company has social media presence")
    
    # Check if they have contact information
    if sponsor.get("email") or sponsor.get("phone") or sponsor.get("contact_page"):
        score += 10
        reasons.append("Company has contact information available")
    
    # Cap the score at 100
    score = min(score, 100)
    
    return {
        "score": score,
        "reasons": reasons
    }

if __name__ == "__main__":
    # Run the scraper function if this script is executed directly
    potential_sponsors = search_potential_sponsors()
    print(f"Found {len(potential_sponsors)} potential sponsors")
    
    # Analyze each sponsor
    for sponsor in potential_sponsors:
        analysis = analyze_sponsor_fit(sponsor)
        sponsor["fit_analysis"] = analysis
    
    # Sort sponsors by fit score
    potential_sponsors.sort(key=lambda x: x["fit_analysis"]["score"], reverse=True)
    
    # Save the analyzed results
    output_dir = "data"
    output_file = os.path.join(output_dir, "analyzed_sponsors.json")
    
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(potential_sponsors, f, indent=2)
    
    print(f"Saved analyzed results to {output_file}")
    
    # Print top 10 potential sponsors
    print("\nTop 10 Potential Sponsors:")
    for i, sponsor in enumerate(potential_sponsors[:10], 1):
        print(f"{i}. {sponsor['name']} - Score: {sponsor['fit_analysis']['score']}")
        print(f"   Website: {sponsor['website']}")
        print(f"   Reasons: {', '.join(sponsor['fit_analysis']['reasons'])}")
        print() 