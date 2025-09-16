import { fetchPrediction } from './api.js';

async function checkUrl() {
  const url = document.getElementById("urlInput").value.trim();
  const resultDiv = document.getElementById("result");
  
  if (!url) {
    resultDiv.innerHTML = "<span class='danger'>يرجى إدخال رابط للتحقق منه.</span>";
    return;
  }

  // Clear previous results and show loading
  resultDiv.innerHTML = "<span class='loading'>جاري الفحص...</span>";
  
  try {
    const data = await fetchPrediction(url);
    console.log("Received data:", data);
    
    const prediction = data.prediction || "unknown";
    const probability = data.probability !== undefined ? (data.probability).toFixed(2) : "N/A";
    
    let resultText = "";
    
      if (prediction.toLowerCase() === "phishing") {
        resultText = `⚠️ الرابط غير آمن! التوقع: ${prediction.toUpperCase()} - نسبة الامان: ${probability}%`;
        resultDiv.innerHTML = `<span class='danger'>${resultText}</span>`;
      } else if (prediction.toLowerCase() === "legit") {
        resultText = `✅ الرابط آمن! التوقع: ${prediction.toUpperCase()} - نسبة الامان: ${probability}%`;
        resultDiv.innerHTML = `<span class='safe'>${resultText}</span>`;
      } else {
        resultText = `⚠️ لا يمكن التأكد من حالة الرابط - التوقع: ${prediction} - نسبة الامان: ${probability}%`;
        resultDiv.innerHTML = `<span class='warning'>${resultText}</span>`;
      }


  } catch (error) {
    console.error("Error checking URL:", error);
    resultDiv.innerHTML = `<span class='danger'>حدث خطأ أثناء الفحص: ${error.message}</span>`;
  }
}

window.checkUrl = checkUrl;
