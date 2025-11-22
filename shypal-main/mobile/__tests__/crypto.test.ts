import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';

// deterministic seed for tests (32 bytes)
const SEED_A = new Uint8Array(32).fill(1);
const SEED_B = new Uint8Array(32).fill(2);

function seedKeyPair(seed: Uint8Array) {
  return nacl.box.keyPair.fromSecretKey
    ? nacl.box.keyPair.fromSecretKey(seed)
    : nacl.sign.keyPair.fromSeed(seed);
}

test('X25519 symmetry: shared secret A->B equals B->A', () => {
  const a = seedKeyPair(SEED_A);
  const b = seedKeyPair(SEED_B);

  const sharedAB = nacl.box.before(b.publicKey, a.secretKey);
  const sharedBA = nacl.box.before(a.publicKey, b.secretKey);

  expect(Buffer.from(sharedAB)).toEqual(Buffer.from(sharedBA));
});

test('AEAD roundtrip with nacl.box.after (encrypt/decrypt) works', () => {
  const a = seedKeyPair(SEED_A);
  const b = seedKeyPair(SEED_B);

  const shared = nacl.box.before(b.publicKey, a.secretKey);
  const nonce = new Uint8Array(nacl.box.nonceLength);
  nonce.fill(0);
  const message = Buffer.from('hello shy pal');

  const sealed = nacl.box.after(message, nonce, shared);
  const opened = nacl.box.open.after(sealed, nonce, shared);

  expect(opened).not.toBeNull();
  expect(Buffer.from(opened).toString()).toBe('hello shy pal');
});
