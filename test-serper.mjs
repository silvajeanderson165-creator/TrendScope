import { config } from "dotenv";
config();

async function trySerperSearch(query) {
  const apiKey = process.env.SERPER_API_KEY;
  console.log("Using API KEY:", apiKey ? apiKey.substring(0, 10) + "..." : "NONE");
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
       console.log("ABORTING FETCH");
       controller.abort();
    }, 4000);

    console.log("Fetching Serper...");
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        gl: "br",
        hl: "pt-br",
        num: 5,
      }),
      signal: controller.signal,
    });
    console.log("Serper response status:", response.status);
    clearTimeout(timeout);

    const data = await response.json();
    console.log("Serper data organic length:", data.organic ? data.organic.length : 0);
  } catch (e) {
    console.error("Error in trySerperSearch:", e);
  }
}
trySerperSearch("Programação");
