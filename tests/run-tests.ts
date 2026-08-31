import { runSecurityTests } from "./security.test";
import { runApiTests } from "./api.test";

console.log("==========================================");
console.log("   AUTOMATED TEST RUNNER — THE PANEL AI   ");
console.log("==========================================");

try {
  runSecurityTests();
  runApiTests();
  console.log("------------------------------------------");
  console.log("🎉 ALL TEST SUITES EXECUTED WITH 100% SUCCESS!");
  console.log("------------------------------------------\n");
  process.exit(0);
} catch (error) {
  console.error("\n❌ TEST SUITE FAILED WITH ERRORS:");
  console.error(error);
  process.exit(1);
}
