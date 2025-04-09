from flask import Flask, request, jsonify
from flask_cors import CORS
import os 
from dotenv import load_dotenv
import psycopg2
from scraper import scraper
load_dotenv()
# load env 


app = Flask(__name__)
CORS(app)

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify(message="Hello, World!")

@app.route('/api/scrape', methods=['GET','POST'])
def scrape():
    if request.method == 'GET':
        scraped_data = scraper()
        return jsonify(scraped_data)



if __name__ == '__main__':
    app.run(debug=True)
