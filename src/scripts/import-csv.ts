import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { db } from "@/db/index";
import { tasks } from "@/db/schema";
import fetch from "node-fetch";

async function importTasks(options: { deleteExisting?: boolean } = {}) {
  try {
    console.log("⏳ Importing tasks from CSV...");
    const start = Date.now();

    // Read the CSV file
    const csvFilePath = path.resolve(process.cwd(), "tasks.csv");
    const csvContent = fs.readFileSync(csvFilePath, "utf-8");

    // Parse the CSV content
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    });

    console.log(`📄 Found ${records.length} tasks in CSV file`);

    // Format the data to match the schema
    const formattedTasks = records.map((record: any) => ({
      code: record.code,
      title: record.title,
      status: record.status,
      priority: record.priority,
      label: "bug", // Default label since it's not in the CSV
      archived: record.archived === "true",
      createdAt: new Date(record.createdAt),
    }));

    // Delete existing tasks if requested
    if (options.deleteExisting) {
      console.log("🗑️  Deleting existing tasks...");
      await db.delete(tasks);
    }

    // Insert the data into the database
    const result = await db
      .insert(tasks)
      .values(formattedTasks)
      .onConflictDoNothing();

    const end = Date.now();
    console.log(`✅ Import completed in ${end - start}ms`);
    console.log(`✅ Imported ${formattedTasks.length} tasks from CSV`);

    // Try to revalidate the cache
    try {
      console.log("🔄 Revalidating cache...");
      const revalidateResponse = await fetch(
        "http://localhost:3000/api/revalidate?tag=tasks",
        {
          method: "POST",
        }
      );

      if (revalidateResponse.ok) {
        console.log("✅ Cache revalidated successfully");
      } else {
        console.log("⚠️ Cache revalidation failed, but data was imported");
        console.log("   You may need to restart the dev server to see changes");
      }
    } catch (error) {
      console.log("⚠️ Cache revalidation failed (is the dev server running?)");
      console.log("   You may need to restart the dev server to see changes");
    }

    console.log("\n📋 Next steps:");
    console.log(
      "1. If the cache revalidation failed, restart the development server:"
    );
    console.log("   pnpm dev");
    console.log("2. Refresh your browser to see the updated data");

    process.exit(0);
  } catch (err) {
    console.error("❌ Import failed");
    console.error(err);
    process.exit(1);
  }
}

// Check if delete_existing flag is passed
const deleteExisting = process.argv.includes("--delete-existing");

importTasks({ deleteExisting }).catch((err) => {
  console.error("❌ Unexpected error during import");
  console.error(err);
  process.exit(1);
});
