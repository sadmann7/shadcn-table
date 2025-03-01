import { env } from "@/env.js";
import fetch from "node-fetch";

async function revalidateCache() {
  try {
    console.log("⏳ Revalidating cache...");
    const start = Date.now();
    // Get the base URL from the environment or use a default
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Revalidate the tasks tag
    const response = await fetch(`${baseUrl}/api/revalidate?tag=tasks`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to revalidate: ${response.statusText}`);
    }

    const result = await response.json();

    const end = Date.now();
    console.log(`✅ Cache revalidation completed in ${end - start}ms`);
    console.log("Revalidation result:", result);

    process.exit(0);
  } catch (err) {
    console.error("❌ Cache revalidation failed");
    console.error(err);
    process.exit(1);
  }
}

revalidateCache().catch((err) => {
  console.error("❌ Unexpected error during cache revalidation");
  console.error(err);
  process.exit(1);
});
