async function checkUrl() {
  const url = document.getElementById("urlInput").value.trim();
  const apiKey = ""; 
  const loading = document.getElementById("loading");
  const resultDiv = document.getElementById("result");

  if (!url) {
      resultDiv.innerHTML = "<span class='danger'>يرجى إدخال رابط للتحقق منه.</span>";
      return;
  }

  loading.innerHTML = "جاري الفحص...";
  resultDiv.innerHTML = "";

  try {
      const response = await fetch("https://www.virustotal.com/api/v3/urls", {
          method: "POST",
          headers: {
              "x-apikey": apiKey,
              "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({ url: url })
      });

      const data = await response.json();
      const scanId = data.data.id; // الحصول على معرف الفحص

      // جلب نتائج الفحص
      const analysisResponse = await fetch(`https://www.virustotal.com/api/v3/analyses/${scanId}`, {
          headers: { "x-apikey": apiKey }
      });

      const analysisData = await analysisResponse.json();
      const stats = analysisData.data.attributes.stats;

      const maliciousCount = stats.malicious || 0;
      const totalEngines = stats.malicious + stats.undetected + stats.harmless;
      const safetyPercentage = ((totalEngines - maliciousCount) / totalEngines) * 100;

      loading.innerHTML = "";

      if (maliciousCount > 0) {
          resultDiv.innerHTML = `<span class='danger'>⚠️ الرابط غير آمن! نسبة الأمان: ${safetyPercentage.toFixed(2)}%</span>`;
      } else {
          resultDiv.innerHTML = `<span class='safe'>✅ الرابط آمن! نسبة الأمان: ${safetyPercentage.toFixed(2)}%</span>`;
      }
  } catch (error) {
      console.error("Error checking URL:", error);
      resultDiv.innerHTML = "<span class='danger'>حدث خطأ أثناء الفحص. يرجى المحاولة مرة أخرى.</span>";
  }
}
