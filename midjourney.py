import os 
from dotenv import load_dotenv
load_dotenv()
import requests
import json
HUGGINGFACE_API_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")
# Using a standard Stable Diffusion model instead of a LoRA adapter
API_URL = "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5"
headers = {"Authorization": f"Bearer {HUGGINGFACE_API_TOKEN}"}

def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    print(f"Status code: {response.status_code}")
    print(f"Response headers: {response.headers}")
    
    # Try to decode the response as JSON first to check for error messages
    try:
        json_response = response.json()
        print(f"JSON response: {json_response}")
        return None
    except json.JSONDecodeError:
        # If not JSON, it might be an image
        return response.content

image_bytes = query({
    "inputs": "Astronaut riding a horse",
})

if image_bytes:
    # You can access the image with PIL.Image for example
    import io
    from PIL import Image
    try:
        image = Image.open(io.BytesIO(image_bytes))
        # Save the image to a file
        image.save("generated_image.png")
        print("Image saved successfully!")
    except Exception as e:
        print(f"Error processing image: {e}")
else:
    print("No image data received from the API.")
