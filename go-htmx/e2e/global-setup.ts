import fs from "fs";
import path from "path";

export default async function globalSetup() {
  const testDataDir = path.join(process.cwd(), "data", "e2e");

  if (fs.existsSync(testDataDir)) {
    fs.rmSync(testDataDir, { recursive: true });
  }

  fs.mkdirSync(testDataDir, { recursive: true });
}
