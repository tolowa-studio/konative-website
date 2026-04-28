import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";

// Resolve relative to this file: web/scripts/etl/phase3/utils.ts → repo root (4 levels up)
export const repoRoot = path.resolve(__dirname, "..", "..", "..", "..");
export const buildRoot = path.join(repoRoot, ".tmp", "etl-phase3");

export interface CommandOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
}

export async function runCommand(
  command: string,
  args: string[],
  options: CommandOptions = {}
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? process.cwd(),
      env: { ...process.env, ...(options.env ?? {}) },
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) return resolve();
      reject(
        new Error(`Command failed (${code}): ${[command, ...args].join(" ")}`)
      );
    });
  });
}

export async function ensureBuildDirs(): Promise<void> {
  await mkdir(buildRoot, { recursive: true });
  for (const sub of ["raw", "geojson", "pmtiles"]) {
    await mkdir(path.join(buildRoot, sub), { recursive: true });
  }
}

export function toIsoDate(): string {
  return new Date().toISOString();
}
