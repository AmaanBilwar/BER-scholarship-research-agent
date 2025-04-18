from flask import Flask, request, jsonify
from flask_cors import CORS
import os 
from dotenv import load_dotenv
import psycopg2
from sponsor_scraper import search_potential_sponsors
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
from datetime import datetime

app = Flask(__name__)
CORS(app)

# MongoDB connection
MONGO_URI = os.getenv('MONGODB_URI')
client = MongoClient(MONGO_URI)
db = client['ber_scholarship_db']
sponsors_collection = db['sponsors']
analyzed_sponsors_collection = db['analyzed_sponsors']
templates_collection = db['templates']  # New collection for templates

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify(message="Hello, World!")

@app.route('/api/scrape', methods=['GET','POST'])
def scrape():
    if request.method == 'GET':
        scraped_data = search_potential_sponsors()
        # Save scraped data to MongoDB
        for sponsor in scraped_data:
            sponsor['created_at'] = datetime.utcnow()
            sponsors_collection.update_one(
                {'name': sponsor['name']},
                {'$set': sponsor},
                upsert=True
            )
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
        
        # Check if we have any sponsors in the database
        sponsors_count = sponsors_collection.count_documents({})
        if sponsors_count == 0:
            return jsonify({
                'success': False,
                'message': 'No sponsors found in the database. Please run the scraper first to collect sponsor data.'
            }), 404
        
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
                
                # Save template to MongoDB
                template_data = {
                    'sponsor_name': sponsor_name,
                    'template_content': template_content,
                    'created_at': datetime.utcnow(),
                    'user_info': {
                        'name': user_name,
                        'position': user_position,
                        'email': user_email,
                        'phone': user_phone
                    },
                    'team_info': {
                        'website': team_website,
                        'mission': team_mission
                    },
                    'template_info': {
                        'club_description': club_description,
                        'university_description': university_description,
                        'specific_aspect': specific_aspect,
                        'additional_benefits': additional_benefits
                    }
                }
                
                # Update or insert template
                templates_collection.update_one(
                    {'sponsor_name': sponsor_name},
                    {'$set': template_data},
                    upsert=True
                )
                
                return jsonify({
                    'success': True,
                    'message': f'Template generated and saved for {sponsor_name}',
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
            
            if not template_paths:
                return jsonify({
                    'success': False,
                    'message': 'No templates were generated. Make sure there are sponsors in the database.'
                }), 404
            
            # Save all templates to MongoDB
            saved_templates = []
            for sponsor_name, template_path in template_paths.items():
                template_content = get_template_content(template_path)
                
                template_data = {
                    'sponsor_name': sponsor_name,
                    'template_content': template_content,
                    'created_at': datetime.utcnow(),
                    'user_info': {
                        'name': user_name,
                        'position': user_position,
                        'email': user_email,
                        'phone': user_phone
                    },
                    'team_info': {
                        'website': team_website,
                        'mission': team_mission
                    },
                    'template_info': {
                        'club_description': club_description,
                        'university_description': university_description,
                        'specific_aspect': specific_aspect,
                        'additional_benefits': additional_benefits
                    }
                }
                
                # Update or insert template
                templates_collection.update_one(
                    {'sponsor_name': sponsor_name},
                    {'$set': template_data},
                    upsert=True
                )
                
                saved_templates.append({
                    'sponsor_name': sponsor_name,
                    'template_content': template_content
                })
            
            return jsonify({
                'success': True,
                'message': f'Generated and saved {len(saved_templates)} templates',
                'templates': saved_templates
            })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error generating template: {str(e)}'
        }), 500

@app.route('/api/templates', methods=['GET'])
def get_templates():
    """
    Get all saved templates from MongoDB.
    """
    try:
        templates = list(templates_collection.find({}, {'_id': 0}))
        return jsonify({
            'success': True,
            'templates': templates
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error loading templates: {str(e)}'
        }), 500

@app.route('/api/templates/<sponsor_name>', methods=['GET'])
def get_template(sponsor_name):
    """
    Get a specific template by sponsor name.
    """
    try:
        template = templates_collection.find_one(
            {'sponsor_name': sponsor_name},
            {'_id': 0}
        )
        
        if template:
            return jsonify({
                'success': True,
                'template': template
            })
        else:
            return jsonify({
                'success': False,
                'message': f'Template not found for sponsor: {sponsor_name}'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error loading template: {str(e)}'
        }), 500

@app.route('/api/sponsors', methods=['GET'])
def get_sponsors():
    """
    Get a list of all available sponsors from MongoDB.
    """
    try:
        # Get all sponsors from MongoDB
        sponsors = list(sponsors_collection.find({}, {'_id': 0}))
        
        # Extract relevant information
        sponsor_list = []
        for sponsor in sponsors:
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

@app.route('/api/analyzed-sponsors', methods=['GET'])
def get_analyzed_sponsors():
    """
    Get a list of all analyzed sponsors from MongoDB.
    """
    try:
        analyzed_sponsors = list(analyzed_sponsors_collection.find({}, {'_id': 0}))
        return jsonify({
            'success': True,
            'analyzed_sponsors': analyzed_sponsors
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error loading analyzed sponsors: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(debug=True)
