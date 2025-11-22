// Phase-1 crypto placeholder using tweetnacl for deterministic tests.
// WARNING: This is NOT production-grade. Replace with native libsodium/libsignal in Phase-2.
import nacl from 'tweetnacl';
import { encodeUTF8, decodeUTF8, encodeBase64, decodeBase64 } from 'tweetnacl-util';

export function generateKeypair() {
  const kp = nacl.box.keyPair();
  return { publicKey: Buffer.from(kp.publicKey).toString('base64'), secretKey: Buffer.from(kp.secretKey).toString('base64') };
}

export function sharedSecret(privateKeyB64: string, publicKeyB64: string) {
  const sk = Buffer.from(privateKeyB64, 'base64');
  const pk = Buffer.from(publicKeyB64, 'base64');
  return nacl.box.before(new Uint8Array(pk), new Uint8Array(sk));
}
