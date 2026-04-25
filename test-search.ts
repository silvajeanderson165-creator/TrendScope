import { config } from "dotenv";
config();
import { appRouter } from "./server/router";

async function run() {
  console.log("Testing search procedure...");
  
  const caller = appRouter.createCaller({
    req: new Request("http://localhost"),
    resHeaders: new Headers(),
  });

  console.log("Calling search...");
  const t0 = Date.now();
  const res = await caller.search.search({ query: "Programação" });
  console.log(`Done in ${Date.now() - t0}ms. Results count:`, res.results.length);
}
run();
