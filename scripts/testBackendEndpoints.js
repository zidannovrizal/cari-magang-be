// Test semua endpoint backend
const https = require("https");
const http = require("http");

const testBackendEndpoints = async () => {
  const baseUrl = "https://cari-magang-be-production.up.railway.app";

  console.log("🔍 Testing Backend Endpoints...");
  console.log("📍 Base URL:", baseUrl);

  const endpoints = [
    { path: "/api/health", method: "GET", name: "Health Check" },
    {
      path: "/api/auth/register",
      method: "POST",
      name: "Register",
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "123456",
      },
    },
    {
      path: "/api/auth/login",
      method: "POST",
      name: "Login",
      body: { email: "test@example.com", password: "123456" },
    },
    { path: "/api/job-board/popular", method: "GET", name: "Popular Jobs" },
    {
      path: "/api/job-board/organizations",
      method: "GET",
      name: "Organizations",
    },
    { path: "/api/sdg8", method: "GET", name: "SDG8 Info" },
  ];

  for (const endpoint of endpoints) {
    console.log(`\n🔗 Testing: ${endpoint.method} ${endpoint.path}`);

    try {
      const options = {
        method: endpoint.method,
        headers: {
          "Content-Type": "application/json",
          Origin: "https://carimagang.netlify.app",
        },
        timeout: 15000,
      };

      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body);
      }

      const url = new URL(`${baseUrl}${endpoint.path}`);
      const requestOptions = {
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: url.pathname + url.search,
        method: endpoint.method,
        headers: {
          "Content-Type": "application/json",
          Origin: "https://carimagang.netlify.app",
        },
      };

      if (endpoint.body) {
        requestOptions.headers["Content-Length"] = Buffer.byteLength(
          JSON.stringify(endpoint.body)
        );
      }

      const client = url.protocol === "https:" ? https : http;

      const response = await new Promise((resolve, reject) => {
        const req = client.request(requestOptions, (res) => {
          let data = "";
          res.on("data", (chunk) => {
            data += chunk;
          });
          res.on("end", () => {
            resolve({
              status: res.statusCode,
              statusText: res.statusMessage,
              headers: res.headers,
              data,
            });
          });
        });

        req.on("error", reject);

        if (endpoint.body) {
          req.write(JSON.stringify(endpoint.body));
        }
        req.end();
      });

      console.log(`📊 Status: ${response.status} ${response.statusText}`);
      console.log(`📋 Headers:`);
      console.log(`   Content-Type: ${response.headers["content-type"]}`);
      console.log(
        `   CORS Origin: ${response.headers["access-control-allow-origin"]}`
      );

      try {
        const jsonData = JSON.parse(response.data);
        console.log(`📄 Response:`, jsonData);
      } catch (parseError) {
        console.log(`📄 Response (raw):`, response.data.substring(0, 300));
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  console.log("\n🔧 Backend Test Summary:");
  console.log("1. Check if all endpoints respond correctly");
  console.log("2. Verify database connections work");
  console.log("3. Ensure CORS headers are present");
  console.log("4. Test authentication endpoints");
};

testBackendEndpoints();
