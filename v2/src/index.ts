import Flagship from "@flagship.io/js-sdk";
import { performance } from "perf_hooks";
import { ENV_ID, API_KEY } from "./config";

var osu = require("node-os-utils");
var cpu = osu.cpu;

cpu.usage().then((cpuPercentage: any) => {
  console.log(cpuPercentage); // 10.38
});

const flagshipSDK = Flagship.start(ENV_ID, API_KEY, {
  fetchNow: false,
  decisionMode: "Bucketing",
  pollingInterval: 60,
  activateNow: false,
});

flagshipSDK.startBucketingPolling();

async function loadFlagshipUser(userId: number): Promise<void> {
  // Create a new visitor
  const visitor = flagshipSDK.newVisitor(
    userId.toString(),
    {},
    {
      isAuthenticated: true,
    }
  );
  // Wait for the visitor to be ready.
  const t1 = performance.now();
  await new Promise((resolve) => {
    visitor.on("ready", () => {
      resolve(visitor);
    });
  });
  console.log("visitor ready time", performance.now() - t1);
  // Load flags
  const t2 = performance.now();
  await visitor.synchronizeModifications(true);
  console.log("sync time", performance.now() - t2);
}
async function main(iterations: number): Promise<void> {
  // Give flagship time to load
  await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
  const t1 = performance.now();
  const promises: Promise<void>[] = [];
  // Load X flagship users in parallel
  for (let i = 0; i < iterations; ++i) {
    promises.push(loadFlagshipUser(i));
  }
  await Promise.all(promises);
  console.log("total time", performance.now() - t1);
}
// Load 20 flagship users in parallel.
void main(20).then(() => {
  process.exit();
});
