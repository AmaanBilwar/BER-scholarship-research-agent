# Formula SAE Sponsor Research Agent

This project contains tools to help Formula SAE electric racecar teams find potential sponsors. The scraper searches for companies that might be interested in sponsoring your team and analyzes their fit based on various criteria.

## Features

- Searches for companies that might sponsor Formula SAE teams
- Extracts contact information from company websites
- Analyzes how well each company might fit as a sponsor
- Ranks potential sponsors by fit score
- Saves results in JSON format for further analysis

## Setup

1. Clone this repository
2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Create a `.env` file in the root directory with your Serper API key:
   ```
   SCRAPER_API_KEY=your_serper_api_key_here
   ```
   You can get a Serper API key by signing up at [serper.dev](https://serper.dev)

## Usage

### Basic Scraper

Run the basic scraper to find potential sponsors:

```
python backend/scraper.py
```

This will search for potential sponsors and save the results to `data/potential_sponsors.json`.

### Advanced Scraper

Run the advanced scraper to find potential sponsors and analyze their fit:

```
python backend/sponsor_scraper.py
```

This will:
1. Search for potential sponsors
2. Extract contact information from their websites
3. Analyze how well each company might fit as a sponsor
4. Rank the sponsors by fit score
5. Save the results to `data/analyzed_sponsors.json`
6. Print the top 10 potential sponsors to the console

## Customization

You can customize the search queries in the `search_potential_sponsors()` function to target specific types of companies.

You can also modify the `analyze_sponsor_fit()` function to change how the fit score is calculated based on your team's specific needs.

## Notes

- The scraper uses the Serper API to perform Google searches, which has rate limits. Be mindful of how many searches you perform.
- The contact information extraction is based on common patterns and may not work for all websites.
- Some websites may block scraping attempts. The scraper includes basic error handling, but you may need to adjust the code for specific websites.