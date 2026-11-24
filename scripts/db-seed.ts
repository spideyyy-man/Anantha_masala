import { runBootstrap } from '../src/db/bootstrap';
import { getDbMode, resetDbForTesting } from '../src/db';

async function main() {
  await runBootstrap(true);
  console.log(`Database seeded cleanly from verified 35-image catalog in [${getDbMode()}] mode.`);
  await resetDbForTesting();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
