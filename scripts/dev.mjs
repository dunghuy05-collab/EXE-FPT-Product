import { spawn } from "node:child_process";

const npmCli = process.env.npm_execpath;
const command = npmCli ? process.execPath : "npm";
const npmArgs = npmCli ? [npmCli] : [];
const spawnOptions = { stdio: "inherit" };
const children = [
  spawn(
    command,
    [...npmArgs, "run", "dev", "--prefix", "server"],
    spawnOptions,
  ),
  spawn(
    command,
    [...npmArgs, "run", "dev", "--prefix", "client"],
    spawnOptions,
  ),
];

let stopping = false;
const stop = (signal = "SIGTERM") => {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (!child.killed) child.kill(signal);
};

for (const child of children) {
  child.on("error", (error) => {
    console.error(error);
    stop();
    process.exitCode = 1;
  });
  child.on("exit", (code) => {
    if (!stopping && code) process.exitCode = code;
    stop();
  });
}

process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));
