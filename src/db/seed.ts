import { generateTasks } from "@/app/_actions/task"

async function runSeed() {
  console.log("⏳ Running seed...")

  const start = Date.now()

  await generateTasks({ count: 100, reset: true })

  const end = Date.now()

  console.log(`✅ Seed completed in ${end - start}ms`)

  process.exit(0)
}

runSeed().catch((err) => {
  console.error("❌ Seed failed")
  console.error(err)
  process.exit(1)
})
