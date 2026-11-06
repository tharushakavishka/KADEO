const { spawn } = require("child_process");
const path = require("path");

console.log("Starting Next.js Server...");

const nextBin = path.join(__dirname, "node_modules", "next", "dist", "bin", "next");

const child = spawn(process.execPath, [nextBin, "start", "-p", "3000"], {
  stdio: "inherit",
  env: { ...process.env },
});

child.on("error", (err) => {
  console.error("Child error:", err);
});

child.on("exit", (code, signal) => {
  console.log(`Child exited with code ${code} and signal ${signal}`);
});
