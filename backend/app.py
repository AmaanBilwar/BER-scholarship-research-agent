from flask import Flask, request, jsonify
from flask_cors import CORS
import os 
from dotenv import load_dotenv
import psycopg2
from scraper import search_potential_sponsors
from template_generator import (
    generate_template_for_specific_sponsor,
    generate_templates_for_all_sponsors,
    get_template_content,
    load_sponsors_data
)
load_dotenv()
# load env 
from pymongo import MongoClient
import json


app = Flask(__name__)
CORS(app)

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify(message="Hello, World!")

@app.route('/api/scrape', methods=['GET','POST'])
def scrape():
    if request.method == 'GET':
        scraped_data = search_potential_sponsors()
        return jsonify(scraped_data)

@app.route('/api/generate', methods=['POST'])
def generate_template():
    """
    Generate an email template for a sponsor.
    
    Expected JSON payload:
    {
        "sponsor_name": "Company Name",  # Optional, if not provided, generate for all sponsors
        "club_description": "Description of the club",
        "university_description": "Description of the university",
        "user_name": "User Name",
        "user_position": "User Position",
        "user_email": "user@example.com",
        "user_phone": "123-456-7890",
        "team_website": "www.example.com",
        "team_mission": "Team mission statement",
        "specific_aspect": "Specific aspect of the company",
        "additional_benefits": ["Benefit 1", "Benefit 2", ...]
    }
    """
    try:
        data = request.json
        
        # Extract required fields
        club_description = data.get('club_description', '')
        university_description = data.get('university_description', '')
        
        # Extract optional fields with defaults
        user_name = data.get('user_name', '[YOUR_NAME]')
        user_position = data.get('user_position', '[YOUR_POSITION]')
        user_email = data.get('user_email', '[YOUR_EMAIL]')
        user_phone = data.get('user_phone', '[YOUR_PHONE]')
        team_website = data.get('team_website', '[TEAM_WEBSITE]')
        team_mission = data.get('team_mission', '[TEAM_MISSION]')
        specific_aspect = data.get('specific_aspect', '[SPECIFIC_ASPECT]')
        additional_benefits = data.get('additional_benefits', None)
        
        # Check if a specific sponsor is requested
        sponsor_name = data.get('sponsor_name')
        
        if sponsor_name:
            # Generate template for a specific sponsor
            template_path = generate_template_for_specific_sponsor(
                sponsor_name=sponsor_name,
                club_description=club_description,
                university_description=university_description,
                user_name=user_name,
                user_position=user_position,
                user_email=user_email,
                user_phone=user_phone,
                team_website=team_website,
                team_mission=team_mission,
                specific_aspect=specific_aspect,
                additional_benefits=additional_benefits
            )
            
            if template_path:
                template_content = get_template_content(template_path)
                return jsonify({
                    'success': True,
                    'message': f'Template generated for {sponsor_name}',
                    'template_path': template_path,
                    'template_content': template_content
                })
            else:
                return jsonify({
                    'success': False,
                    'message': f'Sponsor "{sponsor_name}" not found'
                }), 404
        else:
            # Generate templates for all sponsors
            template_paths = generate_templates_for_all_sponsors(
                club_description=club_description,
                university_description=university_description,
                user_name=user_name,
                user_position=user_position,
                user_email=user_email,
                user_phone=user_phone,
                team_website=team_website,
                team_mission=team_mission,
                specific_aspect=specific_aspect,
                additional_benefits=additional_benefits
            )
            
            return jsonify({
                'success': True,
                'message': f'Generated {len(template_paths)} templates',
                'template_paths': template_paths
            })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error generating template: {str(e)}'
        }), 500

@app.route('/api/sponsors', methods=['GET'])
def get_sponsors():
    """
    Get a list of all available sponsors.
    """
    try:
        sponsors = load_sponsors_data()
        
        # Filter out entries that don't look like actual companies
        filtered_sponsors = [
            sponsor for sponsor in sponsors
            if not ("reddit.com" in sponsor.get("name", "") or 
                   "quora.com" in sponsor.get("name", ""))
        ]
        
        # Extract relevant information
        sponsor_list = []
        for sponsor in filtered_sponsors:
            name = sponsor.get("name", "Unknown Company")
            description = sponsor.get("description", "")
            website = sponsor.get("website", "")
            
            sponsor_list.append({
                'name': name,
                'description': description,
                'website': website
            })
        
        return jsonify({
            'success': True,
            'sponsors': sponsor_list
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error loading sponsors: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(debug=True)
