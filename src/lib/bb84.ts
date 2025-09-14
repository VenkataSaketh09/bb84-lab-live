import { QuantumBit, PhotonPacket } from '@/types/bb84';

export const generateRandomBit = (): 0 | 1 => Math.random() < 0.5 ? 0 : 1;

export const generateRandomBasis = (): 'rectilinear' | 'diagonal' => 
  Math.random() < 0.5 ? 'rectilinear' : 'diagonal';

export const generateQuantumBits = (count: number): QuantumBit[] => {
  return Array.from({ length: count }, () => ({
    bit: generateRandomBit(),
    basis: generateRandomBasis(),
  }));
};

export const encodePhoton = (bit: 0 | 1, basis: 'rectilinear' | 'diagonal'): PhotonPacket => ({
  id: Math.random().toString(36).substr(2, 9),
  bit,
  basis,
  timestamp: Date.now(),
});

export const measurePhoton = (
  photon: PhotonPacket, 
  measurementBasis: 'rectilinear' | 'diagonal'
): { bit: 0 | 1; correct: boolean } => {
  const correct = photon.basis === measurementBasis;
  
  if (correct) {
    return { bit: photon.bit, correct: true };
  } else {
    // Random result if bases don't match
    return { bit: generateRandomBit(), correct: false };
  }
};

export const siftKey = (
  aliceBits: QuantumBit[],
  bobBits: QuantumBit[]
): { aliceKey: number[]; bobKey: number[]; matchingIndices: number[] } => {
  const aliceKey: number[] = [];
  const bobKey: number[] = [];
  const matchingIndices: number[] = [];

  for (let i = 0; i < Math.min(aliceBits.length, bobBits.length); i++) {
    if (aliceBits[i].basis === bobBits[i].basis) {
      aliceKey.push(aliceBits[i].bit);
      bobKey.push(bobBits[i].bit);
      matchingIndices.push(i);
    }
  }

  return { aliceKey, bobKey, matchingIndices };
};

export const calculateQBER = (aliceKey: number[], bobKey: number[]): number => {
  if (aliceKey.length !== bobKey.length || aliceKey.length === 0) {
    return 1; // 100% error rate if keys don't match
  }

  const errors = aliceKey.reduce((count, bit, index) => {
    return count + (bit !== bobKey[index] ? 1 : 0);
  }, 0);

  return errors / aliceKey.length;
};

export const generateFinalKey = (siftedKey: number[], errorIndices: number[]): number[] => {
  return siftedKey.filter((_, index) => !errorIndices.includes(index));
};

export const oneTimePadEncrypt = (message: string, key: number[]): string => {
  if (key.length === 0) return '';
  
  const messageBytes = new TextEncoder().encode(message);
  const encrypted = Array.from(messageBytes).map((byte, index) => {
    const keyByte = key[index % key.length];
    return byte ^ keyByte;
  });
  
  return btoa(String.fromCharCode(...encrypted));
};

export const oneTimePadDecrypt = (ciphertext: string, key: number[]): string => {
  if (key.length === 0 || !ciphertext) return '';
  
  try {
    const encryptedBytes = Array.from(atob(ciphertext), c => c.charCodeAt(0));
    const decrypted = encryptedBytes.map((byte, index) => {
      const keyByte = key[index % key.length];
      return byte ^ keyByte;
    });
    
    return new TextDecoder().decode(new Uint8Array(decrypted));
  } catch (error) {
    return 'Decryption failed';
  }
};