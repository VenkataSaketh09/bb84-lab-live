# BB84 Quantum Key Distribution Backend

This is the Node.js backend server for the BB84 quantum key distribution protocol simulation.

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm (comes with Node.js)

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

### Running the Server

#### Development Mode (with auto-restart)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3001`

## Features

- Real-time Socket.IO communication
- BB84 protocol simulation
- Multi-client session management
- Eve (eavesdropper) detection
- One-Time Pad encryption/decryption
- QBER (Quantum Bit Error Rate) calculation

## API Endpoints

The server uses Socket.IO for real-time communication with the following events:

### Client to Server Events
- `join_session`: Join the BB84 simulation with a specific role
- `alice_send_photons`: Alice sends quantum photons
- `bob_measurements_complete`: Bob completes photon measurements
- `alice_compare_bases`: Alice initiates base comparison
- `alice_check_qber`: Check quantum bit error rate
- `alice_generate_final_key`: Generate final secure key
- `eve_toggle_eavesdropping`: Toggle Eve's eavesdropping
- `restart_session`: Reset the entire session
- `otp_message_sent`: Send encrypted OTP message

### Server to Client Events
- `session_updated`: BB84 session state update
- `users_updated`: Online users list update
- `photons_received`: Bob receives photons
- `sifted_key_ready`: Key sifting complete
- `eve_intercepted`: Eve intercepts photons
- `otp_message_received`: Receive OTP message

## Session State

The server maintains a global BB84 session with:
- Alice's bits, photons, and keys
- Bob's measurements and keys
- Eve's interception data
- Current protocol phase
- QBER calculations
- Error threshold (11%)

## Security Note

This is a simulation for educational purposes. In a real quantum key distribution system, the quantum channel would use actual photons and quantum mechanics principles.