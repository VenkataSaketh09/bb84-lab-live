const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: true, // Allow all origins for published apps, or specify your domain
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// BB84 Session Management
let bb84Session = {
  id: uuidv4(),
  alice: {
    bits: [],
    sentPhotons: [],
    siftedKey: [],
    finalKey: []
  },
  bob: {
    bits: [],
    receivedPhotons: [],
    siftedKey: [],
    finalKey: []
  },
  eve: {
    interceptedPhotons: [],
    active: false
  },
  phase: 'setup',
  qber: 0,
  threshold: 0.11
};

let connectedClients = {};
let onlineUsers = [];

// BB84 Protocol Functions
function generateRandomBit() {
  return Math.random() < 0.5 ? 0 : 1;
}

function generateRandomBasis() {
  return Math.random() < 0.5 ? 'rectilinear' : 'diagonal';
}

function measurePhoton(photon, measurementBasis) {
  const correct = photon.basis === measurementBasis;
  
  if (correct) {
    return { bit: photon.bit, correct: true };
  } else {
    return { bit: generateRandomBit(), correct: false };
  }
}

function siftKey(aliceBits, bobBits) {
  const aliceKey = [];
  const bobKey = [];
  const matchingIndices = [];

  for (let i = 0; i < Math.min(aliceBits.length, bobBits.length); i++) {
    if (aliceBits[i].basis === bobBits[i].basis) {
      aliceKey.push(aliceBits[i].bit);
      bobKey.push(bobBits[i].bit);
      matchingIndices.push(i);
    }
  }

  return { aliceKey, bobKey, matchingIndices };
}

function calculateQBER(aliceKey, bobKey) {
  if (aliceKey.length !== bobKey.length || aliceKey.length === 0) {
    return 1;
  }

  const errors = aliceKey.reduce((count, bit, index) => {
    return count + (bit !== bobKey[index] ? 1 : 0);
  }, 0);

  return errors / aliceKey.length;
}

function resetSession() {
  bb84Session = {
    id: uuidv4(),
    alice: {
      bits: [],
      sentPhotons: [],
      siftedKey: [],
      finalKey: []
    },
    bob: {
      bits: [],
      receivedPhotons: [],
      siftedKey: [],
      finalKey: []
    },
    eve: {
      interceptedPhotons: [],
      active: false
    },
    phase: 'setup',
    qber: 0,
    threshold: 0.11
  };
}

function updateOnlineUsers() {
  onlineUsers = Object.values(connectedClients).map(client => client.role.toUpperCase());
  io.emit('users_updated', onlineUsers);
}

function broadcastSession() {
  io.emit('session_updated', bb84Session);
}

// Socket.IO Events
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_session', (data) => {
    const { role } = data;
    connectedClients[socket.id] = { role, id: socket.id };
    
    console.log(`${role.toUpperCase()} joined the session`);
    updateOnlineUsers();
    broadcastSession();
  });

  socket.on('alice_send_photons', (data) => {
    const { photons } = data;
    
    // Store Alice's photons
    bb84Session.alice.sentPhotons = photons;
    
    let processedPhotons = [...photons];
    
    // If Eve is eavesdropping, intercept and re-send
    if (bb84Session.eve.active) {
      bb84Session.eve.interceptedPhotons = [];
      
      processedPhotons = photons.map(photon => {
        // Eve measures with random basis
        const eveBasis = generateRandomBasis();
        const eveResult = measurePhoton(photon, eveBasis);
        
        bb84Session.eve.interceptedPhotons.push({
          ...photon,
          eveBasis,
          eveMeasurement: eveResult.bit
        });
        
        // Eve re-encodes and sends to Bob
        return {
          ...photon,
          bit: eveResult.bit,
          basis: eveBasis
        };
      });
      
      io.emit('eve_intercepted', { count: processedPhotons.length });
    }
    
    // Send to Bob
    bb84Session.phase = 'transmission';
    io.emit('photons_received', { photons: processedPhotons });
    broadcastSession();
  });

  socket.on('bob_measurements_complete', (data) => {
    const { measurements } = data;
    bb84Session.bob.bits = measurements;
    bb84Session.bob.receivedPhotons = bb84Session.alice.sentPhotons;
    broadcastSession();
  });

  socket.on('alice_compare_bases', (data) => {
    const { bits } = data;
    bb84Session.alice.bits = bits;
    
    // Perform key sifting
    const siftResult = siftKey(bb84Session.alice.bits, bb84Session.bob.bits);
    bb84Session.alice.siftedKey = siftResult.aliceKey;
    bb84Session.bob.siftedKey = siftResult.bobKey;
    bb84Session.phase = 'sifting';
    
    io.emit('sifted_key_ready', { 
      aliceKey: siftResult.aliceKey, 
      bobKey: siftResult.bobKey 
    });
    broadcastSession();
  });

  socket.on('alice_check_qber', () => {
    const qber = calculateQBER(bb84Session.alice.siftedKey, bb84Session.bob.siftedKey);
    bb84Session.qber = qber;
    bb84Session.phase = 'error_check';
    
    console.log(`QBER calculated: ${(qber * 100).toFixed(2)}%`);
    broadcastSession();
  });

  socket.on('alice_generate_final_key', () => {
    // For simplicity, use the sifted key as final key (in real BB84, privacy amplification would be applied)
    bb84Session.alice.finalKey = [...bb84Session.alice.siftedKey];
    bb84Session.bob.finalKey = [...bb84Session.bob.siftedKey];
    bb84Session.phase = 'complete';
    
    console.log(`Final key generated with ${bb84Session.alice.finalKey.length} bits`);
    broadcastSession();
  });

  socket.on('eve_toggle_eavesdropping', (data) => {
    const { active } = data;
    bb84Session.eve.active = active;
    console.log(`Eve eavesdropping: ${active ? 'ACTIVE' : 'INACTIVE'}`);
    broadcastSession();
  });

  socket.on('restart_session', () => {
    console.log('Session restarted');
    resetSession();
    broadcastSession();
  });

  socket.on('otp_message_sent', (otpMessage) => {
    console.log(`OTP message from ${otpMessage.from} to ${otpMessage.to}`);
    io.emit('otp_message_received', otpMessage);
  });

  socket.on('bob_ready_to_receive', () => {
    // Bob is ready to receive photons
    console.log('Bob is ready to receive photons');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    delete connectedClients[socket.id];
    updateOnlineUsers();
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`BB84 Server running on port ${PORT}`);
  console.log(`Session ID: ${bb84Session.id}`);
});