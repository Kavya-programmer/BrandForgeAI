import { createServer } from "http";
import generateHandler from "./artifacts/marketing-os/api/campaign/generate";
import themesHandler from "./artifacts/marketing-os/api/campaign/themes";
import strategyHandler from "./artifacts/marketing-os/api/campaign/generate-strategy";
import videoPlanHandler from "./artifacts/marketing-os/api/campaign/generate-video-plan";
import brandHandler from "./artifacts/marketing-os/api/campaign/generate-brand";
import influencerHandler from "./artifacts/marketing-os/api/campaign/generate-influencer";
import trendStealerHandler from "./artifacts/marketing-os/api/campaign/trend-stealer";
import refineHandler from "./artifacts/marketing-os/api/campaign/refine";

async function simulate(handlerName: string, handler: any, reqMethod: string = "POST") {
  console.log(`\n--- Simulating ${handlerName} ---`);
  
  const req = {
    method: reqMethod,
    body: undefined // Simulate missing body to ensure it doesn't crash
  };
  
  let statusCode = 200;
  let responseData = null;
  
  const res = {
    status: (code: number) => {
      statusCode = code;
      return res;
    },
    json: (data: any) => {
      responseData = data;
    }
  };
  
  try {
    await handler(req as any, res as any);
    console.log(`Status: ${statusCode}`);
    if (statusCode === 500) {
      console.error("FAIL: Returned 500", responseData);
    } else {
      console.log("SUCCESS: Returned JSON", responseData ? "with data" : "empty");
    }
  } catch (err) {
    console.error(`FAIL: Crash in ${handlerName}`, err);
  }
}

async function runTests() {
  await simulate("generate", generateHandler);
  await simulate("themes", themesHandler, "GET");
  await simulate("strategy", strategyHandler);
  await simulate("videoPlan", videoPlanHandler);
  await simulate("brand", brandHandler);
  await simulate("influencer", influencerHandler);
  await simulate("trendStealer", trendStealerHandler);
  await simulate("refine", refineHandler);
  console.log("\nAll simulations finished.");
}

runTests();
