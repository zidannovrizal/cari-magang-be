const JobBoardService = require("./services/jobBoardService");

async function testJobBoardAPI() {
  console.log("🧪 Testing Job Board API Integration...\n");

  const jobBoardService = new JobBoardService();

  try {
    // Test 1: Fetch jobs from API
    console.log("1️⃣ Testing API fetch...");
    const jobs = await jobBoardService.fetchJobsFromAPI("/active-jb-7d");
    console.log(`✅ Successfully fetched ${jobs.length} jobs from API\n`);

    // Test 2: Process and save jobs
    console.log("2️⃣ Testing job processing and saving...");
    const result = await jobBoardService.processAndSaveJobs("/active-jb-7d");
    console.log(`✅ Processed ${result.total} jobs:`);
    console.log(`   - Saved: ${result.saved}`);
    console.log(`   - Errors: ${result.errors}\n`);

    // Test 3: Get jobs from database
    console.log("3️⃣ Testing database retrieval...");
    const dbJobs = await jobBoardService.getJobsFromDatabase(1, 5);
    console.log(`✅ Retrieved ${dbJobs.jobs.length} jobs from database`);
    console.log(`   - Total jobs in DB: ${dbJobs.pagination.total}`);
    console.log(`   - Total pages: ${dbJobs.pagination.totalPages}\n`);

    // Test 4: Get job by ID
    if (dbJobs.jobs.length > 0) {
      console.log("4️⃣ Testing get job by ID...");
      const firstJob = dbJobs.jobs[0];
      const jobDetail = await jobBoardService.getJobById(firstJob.id);
      console.log(
        `✅ Retrieved job: ${jobDetail.title} at ${jobDetail.company_name}\n`
      );
    }

    // Test 5: Test filters
    console.log("5️⃣ Testing filters...");
    const filteredJobs = await jobBoardService.getJobsFromDatabase(1, 3, {
      remote_work: true,
    });
    console.log(`✅ Found ${filteredJobs.jobs.length} remote jobs\n`);

    console.log("🎉 All tests completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testJobBoardAPI();
}

module.exports = testJobBoardAPI;
