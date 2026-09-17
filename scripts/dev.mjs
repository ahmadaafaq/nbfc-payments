import { spawn } from "child_process";

// Extract port from arguments or npm config
let port = process.env.npm_config_port || process.env.PORT || "3000";

for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (/^\d+$/.test(arg)) {
    port = arg;
  } else if ((arg === "-p" || arg === "--port") && process.argv[i + 1]) {
    port = process.argv[i + 1];
    i++;
  } else if (arg.startsWith("--port=")) {
    port = arg.split("=")[1];
  }
}

console.log(`Starting Next.js dev server on port ${port} and host 0.0.0.0...`);

const child = spawn("npx", ["next", "dev", "--turbopack", "-p", String(port), "-H", "0.0.0.0"], {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    PORT: String(port),
  },
});

child.on("exit", (code) => {
  process.exit(code || 0);
});
