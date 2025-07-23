// Test cron sync endpoint
const https = require("https");

const testCronEndpoint = async () => {
  const baseUrl = "https://cari-magang-be-production.up.railway.app";

  console.log("🔍 Testing Cron Sync Endpoint...");
  console.log("📍 Base URL:", baseUrl);

  try {
    const url = new URL(`${baseUrl}/api/job-board/cron-sync`);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Cron-Job.org",
      },
    };

    const response = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            data,
          });
        });
      });

      req.on("error", reject);
      req.end();
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);

    try {
      const jsonData = JSON.parse(response.data);
      console.log(`📄 Response:`, jsonData);

      if (jsonData.success) {
        console.log("✅ Cron sync endpoint working!");
      } else {
        console.log("❌ Cron sync failed:", jsonData.message);
      }
    } catch (parseError) {
      console.log(`📄 Response (raw):`, response.data.substring(0, 300));
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  console.log("\n🔧 Cron Endpoint Test Summary:");
  console.log("1. Endpoint: POST /api/job-board/cron-sync");
  console.log("2. Schedule: 0 17 * * * (17:00 UTC = 00:00 WIB)");
  console.log("3. External Service: cron-job.org");
};

testCronEndpoint();
