import os
import requests
from flask import Flask, render_template, request, jsonify
import joblib
import re
from flask_cors import CORS  # ← مهم لتمكين CORS

app = Flask(__name__)
CORS(app)  # ← يسمح بالوصول من أي origin (Frontend مثلاً)

# Google Drive file ID and path
VECTOR_FILE_ID = "1vYmOBtA0U6xMr-h0VG4jWhENgolex8wL"
VECTOR_FILE_PATH = "tfidf_vectorizer_lr.pkl"

# Download vectorizer if not exists
def download_vectorizer():
    if not os.path.exists(VECTOR_FILE_PATH):
        print("📥 Downloading vectorizer...")
        url = f"https://drive.google.com/uc?export=download&id={VECTOR_FILE_ID}"
        response = requests.get(url)
        with open(VECTOR_FILE_PATH, "wb") as f:
            f.write(response.content)
        print("✅ Download complete.")

download_vectorizer()

# Load model and vectorizer
model = joblib.load("logistic_regression_phishing_model.pkl")
vectorizer = joblib.load(VECTOR_FILE_PATH)

# URL cleaning
def clean_url(url):
    url = url.lower()
    url = re.sub(r'https?:\/\/', '', url)
    url = re.sub(r'www\d*\.', '', url)
    url = re.sub(r':\d+', '', url)
    url = re.sub(r'[\?#].*', '', url)
    url = re.sub(r'[^a-z0-9\-\.\/]', ' ', url)
    url = re.sub(r'\s+', ' ', url)
    return url.strip()

# Home route for form UI
@app.route("/", methods=["GET", "POST"])
def home():
    result = None
    probability = None

    if request.method == "POST":
        raw_url = request.form["url"]
        if not raw_url.strip():
            result = "❌ من فضلك أدخل رابطًا أولاً"
        else:
            cleaned = clean_url(raw_url)
            X = vectorizer.transform([cleaned])
            prediction = model.predict(X)[0]
            probability = round(model.predict_proba(X)[0][1] * 100, 2)
            result = "✅ الرابط آمن" if prediction == 1 else "⚠️ الرابط مشبوه"

    return render_template("index.html", result=result, probability=probability)

# ✅ API endpoint
@app.route("/api/predict", methods=["POST"])
def api_predict():
    data = request.get_json()
    if not data or "url" not in data:
        return jsonify({"error": "يرجى إرسال رابط بصيغة JSON {'url': 'your_url'}"}), 400

    raw_url = data["url"]
    cleaned = clean_url(raw_url)
    X = vectorizer.transform([cleaned])
    prediction = model.predict(X)[0]
    probability = round(model.predict_proba(X)[0][1] * 100, 2)
    result = "legit" if prediction == 1 else "phishing"

    return jsonify({
        "url": raw_url,
        "prediction": result,
        "probability": probability
    })

# Run the app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
