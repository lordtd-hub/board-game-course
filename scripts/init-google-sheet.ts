import { ensureSheetSchema } from "../lib/sheets";

async function main() {
  await ensureSheetSchema();
  console.log("Google Sheet schema is ready.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
