import { Flagship, DecisionMode } from "@flagship.io/js-sdk";

import { performance } from "perf_hooks";

import { ENV_ID, API_KEY } from "./config";

const flagshipSDK = Flagship.start(ENV_ID, API_KEY, {
  fetchNow: false,
  timeout: 5,
  decisionMode: DecisionMode.BUCKETING,
  pollingInterval: 5,
});

async function loadFlagshipUser(userId: number): Promise<void> {
  const visitor = flagshipSDK?.newVisitor({
    visitorId: userId.toString(),
    isAuthenticated: true,
  });

  // Load flags
  const t2 = performance.now();
  await visitor?.fetchFlags();
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
main(20)
  .then(async () => {
    console.log("main");
    process.exit();
  })
  .catch((err) => {
    console.log("error", err);
    process.exit(1);
  });
