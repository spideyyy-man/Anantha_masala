import { ensureDbReady } from '../src/db/bootstrap';
import { getDbMode, resetDbForTesting } from '../src/db';

async function main() {
  await ensureDbReady();
  console.log(`Database schema migrated and verified cleanly in [${getDbMode()}] mode.`);
  await resetDbForTesting();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
