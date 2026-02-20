# server.py — Dapur AI (pakai Groq API)

from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()  # Baca API key dari file .env saat development lokal

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))


@app.route('/')
def index():
    return app.send_static_file('index.html')


@app.route('/api/resep', methods=['POST'])
def get_resep():
    data = request.get_json()
    prompt = data.get('prompt', '')

    if not prompt:
        return jsonify({'error': 'Prompt tidak boleh kosong'}), 400

    try:
        response = client.chat.completions.create(
            model='llama-3.1-8b-instant',
            messages=[{'role': 'user', 'content': prompt}],
            max_tokens=3000
        )
        text = response.choices[0].message.content
        return jsonify({'result': text})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print("🍳 Dapur AI server berjalan di http://localhost:5000")
    app.run(debug=True, port=5000)