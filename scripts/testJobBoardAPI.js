const axios = require("axios");

const BASE_URL = "http://localhost:5000/api";

/**
 * Test script untuk Job Board API
 */
async function testJobBoardAPI() {
  console.log("🧪 Testing Job Board API...\n");

  try {
    // Test 1: Sync jobs dari API eksternal
    console.log("1️⃣ Testing job sync...");
    const syncResponse = await axios.post(`${BASE_URL}/jobs/sync`, {
      limit: 10,
    });
    console.log("✅ Sync response:", syncResponse.data);
    console.log("");

    // Test 2: Get jobs dengan pagination
    console.log("2️⃣ Testing get jobs with pagination...");
    const jobsResponse = await axios.get(`${BASE_URL}/jobs?page=1&limit=5`);
    console.log("✅ Jobs response:", {
      success: jobsResponse.data.success,
      totalJobs: jobsResponse.data.data.length,
      pagination: jobsResponse.data.pagination,
    });
    console.log("");

    // Test 3: Get jobs dengan filter
    console.log("3️⃣ Testing get jobs with filters...");
    const filteredResponse = await axios.get(
      `${BASE_URL}/jobs?search=analyst&location=US`
    );
    console.log("✅ Filtered jobs response:", {
      success: filteredResponse.data.success,
      totalJobs: filteredResponse.data.data.length,
      pagination: filteredResponse.data.pagination,
    });
    console.log("");

    // Test 4: Get job detail
    if (jobsResponse.data.data.length > 0) {
      const firstJobId = jobsResponse.data.data[0].id;
      console.log(`4️⃣ Testing get job detail for ID: ${firstJobId}...`);
      const detailResponse = await axios.get(`${BASE_URL}/jobs/${firstJobId}`);
      console.log("✅ Job detail response:", {
        success: detailResponse.data.success,
        hasData: !!detailResponse.data.data,
      });
      console.log("");
    }

    // Test 5: Get statistics
    console.log("5️⃣ Testing get statistics...");
    const statsResponse = await axios.get(`${BASE_URL}/jobs/stats/summary`);
    console.log("✅ Statistics response:", {
      success: statsResponse.data.success,
      totalJobs: statsResponse.data.data.totalJobs,
      hasCountryStats: statsResponse.data.data.jobsByCountry.length > 0,
      hasOrganizationStats:
        statsResponse.data.data.jobsByOrganization.length > 0,
    });
    console.log("");

    console.log("🎉 All tests completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);

    if (error.code === "ECONNREFUSED") {
      console.log("\n💡 Make sure the server is running:");
      console.log("   npm start");
    }
  }
}

/**
 * Test individual endpoints
 */
async function testIndividualEndpoints() {
  console.log("🔍 Testing individual endpoints...\n");

  const endpoints = [
    { name: "Health Check", url: `${BASE_URL}/health`, method: "GET" },
    {
      name: "Sync Jobs",
      url: `${BASE_URL}/jobs/sync`,
      method: "POST",
      data: { limit: 5 },
    },
    { name: "Get Jobs", url: `${BASE_URL}/jobs?page=1&limit=3`, method: "GET" },
    { name: "Get Stats", url: `${BASE_URL}/jobs/stats/summary`, method: "GET" },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.name}...`);

      let response;
      if (endpoint.method === "GET") {
        response = await axios.get(endpoint.url);
      } else if (endpoint.method === "POST") {
        response = await axios.post(endpoint.url, endpoint.data);
      }

      console.log(
        `✅ ${endpoint.name}: ${response.status} - ${
          response.data.success ? "SUCCESS" : "FAILED"
        }`
      );

      if (endpoint.name === "Get Jobs" && response.data.success) {
        console.log(`   📊 Found ${response.data.data.length} jobs`);
      }
    } catch (error) {
      console.log(
        `❌ ${endpoint.name}: ${error.response?.status || "ERROR"} - ${
          error.response?.data?.message || error.message
        }`
      );
    }
    console.log("");
  }
}

// Run tests
if (require.main === module) {
  const testType = process.argv[2];

  if (testType === "individual") {
    testIndividualEndpoints();
  } else {
    testJobBoardAPI();
  }
}

module.exports = { testJobBoardAPI, testIndividualEndpoints };
