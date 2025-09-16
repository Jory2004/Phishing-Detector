
const API_BASE_URL = "https://web-production-a600a.up.railway.app/api/predict";

export async function fetchPrediction(url) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  };

const response = await fetch(API_BASE_URL, options);


  if (!response.ok) {
    const data = await response.json(); 
    throw new Error("Error from your model: " + data.message);
  }

  return await response.json(); 
}





// Email Spam Check
export async function checkEmailSpam(emailContent) {
  const API_KEY = 'sqdrKYLp4SKWMtYSEHecfPyObSVHs4f9';
  var myHeaders = new Headers();
  myHeaders.append("apikey", API_KEY);
  var raw = emailContent;

  var requestOptions = {
    method: 'POST',
    redirect: 'follow',
    headers: myHeaders,
    body: raw
  };
  
  const response = await fetch("https://api.apilayer.com/spamchecker?threshold=5", requestOptions)

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('خطأ في المصادقة - تأكد من صحة مفتاح API');
    }
    if (response.status === 429) {
      throw new Error('تم تجاوز حد الاستخدام اليومي/الشهري للـ API');
    }
    const data = await response.json();
    throw new Error('خطأ في فحص البريد الإلكتروني: ' + data.message);
  }
  const data = await response.json();
  return {
    success: true,
    score: data.score || 0,
    isSpam: data.is_spam || false,
    rules: [
      {
        description: data.result || 'تم تحليل المحتوى'
      }
    ]
  };
}
