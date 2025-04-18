import json
import os
import re
from typing import Dict, List, Optional, Tuple
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
MONGO_URI = os.getenv('MONGODB_URI')
client = MongoClient(MONGO_URI)
db = client['ber_scholarship_db']
sponsors_collection = db['sponsors']

def load_sponsors_data(file_path: str = None) -> List[Dict]:
    """
    Load the potential sponsors data from MongoDB.
    
    Args:
        file_path: Not used anymore, kept for backward compatibility
        
    Returns:
        List of sponsor dictionaries
    """
    try:
        # Get all sponsors from MongoDB
        sponsors = list(sponsors_collection.find({}, {'_id': 0}))
        return sponsors
    except Exception as e:
        print(f"Error loading sponsors data from MongoDB: {e}")
        return []

def clean_company_name(name: str) -> str:
    """
    Clean the company name to be used in filenames.
    
    Args:
        name: Company name
        
    Returns:
        Cleaned company name
    """
    # Remove special characters and replace spaces with underscores
    cleaned = re.sub(r'[^\w\s-]', '', name)
    cleaned = re.sub(r'[-\s]+', '_', cleaned)
    return cleaned.strip('_')

def extract_company_info(sponsor: Dict) -> Tuple[str, str, Optional[str], Optional[str]]:
    """
    Extract relevant company information from a sponsor entry.
    
    Args:
        sponsor: Sponsor dictionary
        
    Returns:
        Tuple of (company_name, description, email, website)
    """
    company_name = sponsor.get("name", "Unknown Company")
    description = sponsor.get("description", "")
    email = sponsor.get("email")
    website = sponsor.get("website")
    
    return company_name, description, email, website

def generate_email_template(
    company_name: str,
    company_description: str,
    company_email: Optional[str],
    company_website: Optional[str],
    club_description: str,
    university_description: str,
    user_name: str = "[YOUR_NAME]",
    user_position: str = "[YOUR_POSITION]",
    user_email: str = "[YOUR_EMAIL]",
    user_phone: str = "[YOUR_PHONE]",
    team_website: str = "[TEAM_WEBSITE]",
    team_mission: str = "[TEAM_MISSION]",
    specific_aspect: str = "[SPECIFIC_ASPECT]",
    additional_benefits: List[str] = None,
    output_dir: str = "email_templates"
) -> str:
    """
    Generate an email template for a specific company.
    
    Args:
        company_name: Name of the company
        company_description: Description of the company
        company_email: Email of the company contact
        company_website: Website of the company
        club_description: Description of the club
        university_description: Description of the university
        user_name: Name of the user sending the email
        user_position: Position of the user in the team
        user_email: Email of the user
        user_phone: Phone number of the user
        team_website: Website of the team
        team_mission: Mission of the team
        specific_aspect: Specific aspect of the company that aligns with the team
        additional_benefits: Additional benefits to include in the email
        output_dir: Directory to save the template
        
    Returns:
        Path to the generated template file
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Clean company name for filename
    clean_name = clean_company_name(company_name)
    template_filename = f"{clean_name}_email_template.txt"
    template_path = os.path.join(output_dir, template_filename)
    
    # Default benefits if none provided
    if additional_benefits is None:
        additional_benefits = [
            "Connect with talented engineering students",
            "Showcase your products and technologies",
            "Gain visibility at Formula SAE competitions",
            "Support the next generation of automotive engineers"
        ]
    
    # Generate the email template
    template = f"""Subject: Partnership Opportunity with {company_name} - University of Cincinnati Formula Racing Team

Dear {company_name} Team,

I hope this email finds you well. My name is {user_name}, and I am {user_position} with the University of Cincinnati Formula Racing Team.

About Our Team:
{club_description}

About the University of Cincinnati:
{university_description}

About {company_name}:
{company_description}

We are reaching out to explore potential partnership opportunities with {company_name}. Your company's commitment to {specific_aspect} aligns perfectly with our team's mission to {team_mission}.

As a potential sponsor, you would have the opportunity to:
"""
    
    # Add benefits
    for benefit in additional_benefits:
        template += f"- {benefit}\n"
    
    template += f"""
We would welcome the opportunity to discuss how a partnership could benefit both our team and {company_name}. Would you be available for a brief call or meeting to discuss this further?

Thank you for your time and consideration.

Best regards,
{user_name}
University of Cincinnati Formula Racing Team
{user_email}
{user_phone}

P.S. You can learn more about our team at {team_website} and about {company_name} at {company_website or "your company website"}.
"""
    
    # Save the template to a file
    with open(template_path, 'w', encoding='utf-8') as file:
        file.write(template)
    
    return template_path

def generate_templates_for_all_sponsors(
    club_description: str,
    university_description: str,
    user_name: str = "[YOUR_NAME]",
    user_position: str = "[YOUR_POSITION]",
    user_email: str = "[YOUR_EMAIL]",
    user_phone: str = "[YOUR_PHONE]",
    team_website: str = "[TEAM_WEBSITE]",
    team_mission: str = "[TEAM_MISSION]",
    specific_aspect: str = "[SPECIFIC_ASPECT]",
    additional_benefits: List[str] = None,
    output_dir: str = "email_templates"
) -> Dict[str, str]:
    """
    Generate email templates for all sponsors in the data.
    
    Args:
        club_description: Description of the club
        university_description: Description of the university
        user_name: Name of the user sending the email
        user_position: Position of the user in the team
        user_email: Email of the user
        user_phone: Phone number of the user
        team_website: Website of the team
        team_mission: Mission of the team
        specific_aspect: Specific aspect of the company that aligns with the team
        additional_benefits: Additional benefits to include in the email
        output_dir: Directory to save the templates
        
    Returns:
        Dictionary mapping sponsor names to template paths
    """
    sponsors = load_sponsors_data()
    template_paths = {}
    
    for sponsor in sponsors:
        company_name, description, email, website = extract_company_info(sponsor)
        
        # Skip entries that don't look like actual companies
        if "reddit.com" in company_name or "quora.com" in company_name:
            continue
            
        template_path = generate_email_template(
            company_name=company_name,
            company_description=description,
            company_email=email,
            company_website=website,
            club_description=club_description,
            university_description=university_description,
            user_name=user_name,
            user_position=user_position,
            user_email=user_email,
            user_phone=user_phone,
            team_website=team_website,
            team_mission=team_mission,
            specific_aspect=specific_aspect,
            additional_benefits=additional_benefits,
            output_dir=output_dir
        )
        
        template_paths[company_name] = template_path
    
    return template_paths

def generate_template_for_specific_sponsor(
    sponsor_name: str,
    club_description: str,
    university_description: str,
    user_name: str = "[YOUR_NAME]",
    user_position: str = "[YOUR_POSITION]",
    user_email: str = "[YOUR_EMAIL]",
    user_phone: str = "[YOUR_PHONE]",
    team_website: str = "[TEAM_WEBSITE]",
    team_mission: str = "[TEAM_MISSION]",
    specific_aspect: str = "[SPECIFIC_ASPECT]",
    additional_benefits: List[str] = None,
    output_dir: str = "email_templates"
) -> Optional[str]:
    """
    Generate an email template for a specific sponsor by name.
    
    Args:
        sponsor_name: Name of the sponsor to find
        club_description: Description of the club
        university_description: Description of the university
        user_name: Name of the user sending the email
        user_position: Position of the user in the team
        user_email: Email of the user
        user_phone: Phone number of the user
        team_website: Website of the team
        team_mission: Mission of the team
        specific_aspect: Specific aspect of the company that aligns with the team
        additional_benefits: Additional benefits to include in the email
        output_dir: Directory to save the template
        
    Returns:
        Path to the generated template file or None if sponsor not found
    """
    sponsors = load_sponsors_data()
    
    for sponsor in sponsors:
        if sponsor_name.lower() in sponsor.get("name", "").lower():
            company_name, description, email, website = extract_company_info(sponsor)
            
            template_path = generate_email_template(
                company_name=company_name,
                company_description=description,
                company_email=email,
                company_website=website,
                club_description=club_description,
                university_description=university_description,
                user_name=user_name,
                user_position=user_position,
                user_email=user_email,
                user_phone=user_phone,
                team_website=team_website,
                team_mission=team_mission,
                specific_aspect=specific_aspect,
                additional_benefits=additional_benefits,
                output_dir=output_dir
            )
            
            return template_path
    
    return None

def get_template_content(template_path: str) -> str:
    """
    Get the content of a template file.
    
    Args:
        template_path: Path to the template file
        
    Returns:
        Content of the template file
    """
    try:
        with open(template_path, 'r', encoding='utf-8') as file:
            return file.read()
    except Exception as e:
        print(f"Error reading template file: {e}")
        return ""

if __name__ == "__main__":
    # Example usage
    club_description = """
    The University of Cincinnati Formula Racing Team is a student-led organization dedicated to designing, 
    building, and racing a formula-style race car. Our team consists of passionate engineering students 
    who gain hands-on experience in automotive engineering, project management, and teamwork.
    """
    
    university_description = """
    The University of Cincinnati is a premier public research university with a rich history of innovation 
    and excellence in engineering education. Founded in 1819, UC is the second-largest university in Ohio 
    and is consistently ranked among the top engineering schools in the nation.
    """
    
    # Example user inputs
    user_name = "John Doe"
    user_position = "Team Captain"
    user_email = "john.doe@uc.edu"
    user_phone = "(513) 123-4567"
    team_website = "www.ucformularacing.com"
    team_mission = "develop innovative automotive solutions"
    specific_aspect = "sustainable engineering"
    additional_benefits = [
        "Connect with talented engineering students",
        "Showcase your products and technologies",
        "Gain visibility at Formula SAE competitions",
        "Support the next generation of automotive engineers",
        "Collaborate on research and development projects"
    ]
    
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
    
    print(f"Generated {len(template_paths)} email templates in the 'email_templates' directory.")
    
    # Example of generating a template for a specific sponsor
    specific_template = generate_template_for_specific_sponsor(
        sponsor_name="Garrett",
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
    
    if specific_template:
        print(f"Generated specific template for Garrett: {specific_template}")
        print("Template content:")
        print(get_template_content(specific_template))
    else:
        print("Sponsor not found.")
