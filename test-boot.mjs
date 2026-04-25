import app from "./dist/boot.js";

async function run() {
  console.log("Sending ping request...");
  const res = await app.request(new Request("http://localhost/api/trpc/ping"));
  console.log("Ping response status:", res.status);
  console.log("Ping response body:", await res.text());

  console.log("Sending search request...");
  const res2 = await app.request(new Request("http://localhost/api/trpc/search.search?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22query%22%3A%22Design%20UX%22%7D%7D%7D"));
  console.log("Search response status:", res2.status);
  console.log("Search response body:", await res2.text());
}
run();
