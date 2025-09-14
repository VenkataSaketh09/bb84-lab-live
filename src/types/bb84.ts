export interface QuantumBit {
  bit: 0 | 1;
  basis: 'rectilinear' | 'diagonal';
}

export interface PhotonPacket {
  id: string;
  bit: 0 | 1;
  basis: 'rectilinear' | 'diagonal';
  timestamp: number;
}

export interface BB84Session {
  id: string;
  alice: {
    bits: QuantumBit[];
    sentPhotons: PhotonPacket[];
    siftedKey: number[];
    finalKey: number[];
  };
  bob: {
    bits: QuantumBit[];
    receivedPhotons: PhotonPacket[];
    siftedKey: number[];
    finalKey: number[];
  };
  eve: {
    interceptedPhotons: PhotonPacket[];
    active: boolean;
  };
  phase: 'setup' | 'transmission' | 'sifting' | 'error_check' | 'key_generation' | 'complete';
  qber: number;
  threshold: number;
}

export interface Client {
  id: string;
  role: 'alice' | 'bob' | 'eve';
  name: string;
}

export interface OTPMessage {
  id: string;
  from: 'alice' | 'bob';
  to: 'alice' | 'bob';
  plaintext: string;
  ciphertext: string;
  timestamp: number;
}