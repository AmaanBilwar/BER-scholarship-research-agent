import requests
import json
import os
import time
from dotenv import load_dotenv

load_dotenv()

# load env variables
SCRAPER_API_KEY = os.getenv("SERPER_API_KEY")

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
        "companies that sponsor sustainable racing initiatives"
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

if __name__ == "__main__":
    # Run the scraper function if this script is executed directly
    potential_sponsors = search_potential_sponsors()
    print(f"Found {len(potential_sponsors)} potential sponsors")
