import { randomUUID } from 'node:crypto';
import { deletePrivateAsset, downloadPrivateAsset, uploadPrivateAsset } from '../src/lib/object-storage';

async function main() {
  const key = `healthchecks/${randomUUID()}.txt`;
  const expected = Buffer.from(`Aanandha Masala Neon Object Storage smoke test ${new Date().toISOString()}`);

  try {
    await uploadPrivateAsset(key, expected, 'text/plain; charset=utf-8');
    console.log('PASS: object uploaded to private Neon bucket.');

    const actual = Buffer.from(await downloadPrivateAsset(key));
    if (!actual.equals(expected)) throw new Error('Downloaded object bytes do not match uploaded bytes.');
    console.log('PASS: object downloaded and byte-for-byte verified.');
  } finally {
    await deletePrivateAsset(key);
    console.log('PASS: temporary smoke-test object deleted.');
  }
}

main().catch((error) => {
  console.error('Neon Object Storage smoke test failed:', error);
  process.exitCode = 1;
});
