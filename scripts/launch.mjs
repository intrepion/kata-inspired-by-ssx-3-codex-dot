import { spawn } from "node:child_process";
import { openSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import net from "node:net";
const port = Number(process.argv[2] ?? 5201);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw Error("Choose a valid local port");
if (existsSync(".server.pid")) {
  const pid = Number(readFileSync(".server.pid", "utf8"));
  try {
    process.kill(pid, 0);
    console.log(
      `Recorded server process ${pid} is still running. Verify it before starting another.`,
    );
    process.exit(0);
  } catch {}
}
const available = await new Promise((resolve) => {
  const s = net.createServer();
  s.once("error", () => resolve(false));
  s.listen(port, "127.0.0.1", () => s.close(() => resolve(true)));
});
if (!available)
  throw Error(
    `Port ${port} is occupied; choose another without stopping existing servers.`,
  );
const log = openSync("server.log", "a");
const child = spawn(process.execPath, ["scripts/serve.mjs", String(port)], {
  cwd: process.cwd(),
  detached: true,
  stdio: ["ignore", log, log],
});
child.unref();
writeFileSync(".server.pid", String(child.pid));
console.log(`Session server PID ${child.pid}: http://127.0.0.1:${port}`);
