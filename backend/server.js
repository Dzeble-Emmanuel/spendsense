require("dotenv").config();
const app = require("./src/app");

const ensureDemoUser = require("./src/utils/ensureDemoUser");

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`\n🚀 SpendSense Backend running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Auth:   http://localhost:${PORT}/api/auth`);
  console.log(`   API:    http://localhost:${PORT}/api\n`);

  await ensureDemoUser();
});
