import 'fake-indexeddb/auto';

if (!globalThis.crypto) {
  throw new Error('Web Crypto is required for local backups');
}
if (!globalThis.crypto.randomUUID) {
  Object.defineProperty(globalThis.crypto, 'randomUUID', {
    configurable: true,
    value: () => `test-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  });
}
