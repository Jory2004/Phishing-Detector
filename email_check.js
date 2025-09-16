import { checkEmailSpam as apiCheckEmailSpam } from './api.js';

// Audio player state 
let currentAudio = null;

async function handleEmailCheck() {
  const emailInput = document.getElementById("emailInput").value.trim();
  const resultDiv = document.getElementById("result");
  
  if (!emailInput) {
    resultDiv.innerHTML = "<span class='danger'>يرجى إدخال بريد إلكتروني للتحقق منه.</span>";
    return;
  }

  // Clear previous results and show loading
  resultDiv.innerHTML = "<span class='loading'>جاري الفحص...</span>";

  try {
    // Create a more varied test email that includes the input as both sender and content
    // This helps trigger the spam detection more accurately
    const emailContent = `From: sender@example.com
    To: recipient@example.com
    Subject: Important Message from ${emailInput}

    Hello,
    This is regarding your account. Please contact us at ${emailInput}
    Click here: http://bit.ly/${Math.random().toString(36).substring(7)}
    Your verification code is: ${Math.floor(Math.random() * 1000000)}`;

    const result = await apiCheckEmailSpam(emailInput);
    
    // Create result message with more nuanced evaluation
    let resultText = "";
    
    // Use more nuanced thresholds for spam detection
    if (result.score >= 7.5) {
      resultText = `⚠️ البريد الإلكتروني خطير جداً! درجة الخطر: ${result.score.toFixed(2)}/10`;
      resultDiv.innerHTML = `<span class='high-danger'>${resultText}</span>`;
    } else if (result.score >= 5.0) {
      resultText = `⚠️ البريد الإلكتروني مشبوه! درجة الخطر: ${result.score.toFixed(2)}/10`;
      resultDiv.innerHTML = `<span class='danger'>${resultText}</span>`;
    } else if (result.score >= 3.0) {
      resultText = `⚠️ البريد الإلكتروني قد يكون مشبوه! درجة الخطر: ${result.score.toFixed(2)}/10`;
      resultDiv.innerHTML = `<span class='warning'>${resultText}</span>`;
    } else {
      resultText = `✅ البريد الإلكتروني آمن! درجة الخطر: ${result.score.toFixed(2)}/10`;
      resultDiv.innerHTML = `<span class='safe'>${resultText}</span>`;
    }
    
    // Add explanation if available
    if (result.rules && result.rules.length > 0) {
      const reasonsContainer = document.createElement("div");
      reasonsContainer.className = "reasons-container";
      
      const reasonsList = document.createElement("ul");
      result.rules.forEach(rule => {
        if (rule.description) {
          const item = document.createElement("li");
          item.textContent = rule.description;
          reasonsList.appendChild(item);
        }
      });
      
      if (reasonsList.children.length > 0) {
        reasonsContainer.innerHTML = "<h4>أسباب التقييم:</h4>";
        reasonsContainer.appendChild(reasonsList);
        resultDiv.appendChild(reasonsContainer);
      }
    }
    
    // Add audio controls with loading indicator
    // const audioContainer = document.createElement("div");
    // audioContainer.className = "audio-container";
    // audioContainer.innerHTML = "<div class='audio-loading'>جاري تحميل الصوت...</div>";
    // resultDiv.appendChild(document.createElement("br"));
    // resultDiv.appendChild(audioContainer);
    
    // // Get audio
    // const audioFileUrl = await convertTextToSpeech(resultText);
    // if (audioFileUrl) {
    //   // Stop current audio if playing
    //   if (currentAudio) {
    //     currentAudio.pause();
    //     currentAudio = null;
    //   }
      
    //   // Create new audio element
    //   const audioElement = document.createElement("audio");
    //   audioElement.controls = true;
    //   audioElement.preload = "auto";
    //   audioElement.src = audioFileUrl;
    //   currentAudio = audioElement;
      
    //   // Replace loading indicator with audio
    //   audioContainer.innerHTML = "";
    //   audioContainer.appendChild(audioElement);
      
    //   // Play automatically
    //   audioElement.play().catch(e => console.warn("Couldn't autoplay audio:", e));
    // } else {
    //   audioContainer.innerHTML = "<div class='audio-error'>فشل تحميل الصوت</div>";
    // }
  } catch (error) {
    console.error("Error checking email:", error);
    resultDiv.innerHTML = `<span class='danger'>حدث خطأ أثناء الفحص: ${error.message}</span>`;
  }
}

async function convertTextToSpeech(text) {
  // Read the selected language (default to Arabic if not found)
  const language = document.getElementById("languageSelect")?.value || "ar";
  try {
    const response = await fetch('http://localhost:5003/convert', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: text, language: language })
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    
    const data = await response.json();
    return data.file_url;
  } catch (error) {
    console.error("Text-to-speech conversion error:", error);
    return null;
  }
}

window.checkSpam = handleEmailCheck;