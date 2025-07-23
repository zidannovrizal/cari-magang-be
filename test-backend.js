const axios = require("axios");

async function testBackend() {
  console.log("🧪 Testing Backend API...\n");

  try {
    // Test health check
    console.log("1. Testing health check...");
    const healthResponse = await axios.get("http://localhost:5001/api/health");
    console.log("✅ Health check:", healthResponse.data);

    // Test register
    console.log("\n2. Testing register endpoint...");
    const registerData = {
      first_name: "Test",
      last_name: "User",
      email: "test@example.com",
      university: "Universitas Test",
      major: "computer-science",
      password: "password123",
    };

    const registerResponse = await axios.post(
      "http://localhost:5001/api/auth/register",
      registerData
    );
    console.log("✅ Register response:", registerResponse.data);

    // Test login
    console.log("\n3. Testing login endpoint...");
    const loginData = {
      email: "test@example.com",
      password: "password123",
    };

    const loginResponse = await axios.post(
      "http://localhost:5001/api/auth/login",
      loginData
    );
    console.log("✅ Login response:", loginResponse.data);

    // Test job board (public endpoint)
    console.log("\n4. Testing job board endpoint...");
    const jobsResponse = await axios.get("http://localhost:5001/api/job-board");
    console.log("✅ Jobs response:", {
      success: jobsResponse.data.success,
      count: jobsResponse.data.data?.length || 0,
    });

    console.log("\n🎉 All tests passed! Backend is working correctly.");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}

testBackend();
