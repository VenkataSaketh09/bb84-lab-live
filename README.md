# BB84 Quantum Key Distribution Simulation

A full-stack real-time web application that simulates the BB84 quantum key distribution protocol with beautiful animations and multi-client support.

![BB84 Protocol Demo](https://via.placeholder.com/800x400/1a1a2e/16a085?text=BB84+Quantum+Protocol)

## Features

- **Real-time Multi-Client Simulation**: Alice, Bob, and Eve can join from different computers
- **Complete BB84 Protocol**: Bit generation, photon transmission, base comparison, QBER calculation
- **Eavesdropping Detection**: Eve can intercept communications, increasing error rate
- **One-Time Pad Encryption**: Secure message exchange using the generated quantum key
- **Beautiful Animations**: Smooth photon animations with Framer Motion
- **Quantum-Themed UI**: Sci-fi inspired design with glowing effects

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Socket.IO Client** for real-time communication
- **shadcn/ui** components

### Backend
- **Node.js** with Express
- **Socket.IO** for real-time WebSocket communication
- **UUID** for session management

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm (comes with Node.js)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd bb84-simulation
```

### 2. Setup Frontend
```bash
# Install frontend dependencies
npm install

# Start the frontend development server
npm run dev
```

The frontend will be available at `http://localhost:8080`

### 3. Setup Backend
```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install

# Start the backend server
npm run dev
```

The backend server will run on `http://localhost:3001`

### 4. Access the Application
Open your browser and go to `http://localhost:8080`

## How to Use

### 1. Role Selection
When you first access the application, choose your role:
- **Alice**: The quantum key sender
- **Bob**: The quantum key receiver  
- **Eve**: The eavesdropper (optional)

### 2. BB84 Protocol Simulation

#### As Alice:
1. Click "Generate Random Bits + Bases" to create quantum bits
2. Click "Send to Bob" to transmit photons (watch the animation!)
3. Click "Compare Bases" to start key sifting
4. Click "Check QBER" to calculate error rate
5. If QBER is low enough, click "Generate Final Key"

#### As Bob:
1. Click "Receive Photons" to start measurement
2. Watch as photons arrive and get measured
3. See the sifted key appear automatically
4. View the final shared key

#### As Eve:
1. Toggle "Intercept Communications" to start eavesdropping
2. Watch as your interference increases the QBER
3. See the protocol detect your presence!

### 3. One-Time Pad Communication
Once a secure key is established:
1. Type a secret message
2. Click "Encrypt & Send" 
3. The other party receives the encrypted message
4. Click "Decrypt Message" to reveal the original text

## Protocol Details

### BB84 Steps Implemented:
1. **Bit Generation**: Alice generates random bits and bases
2. **Quantum Transmission**: Photons sent through quantum channel
3. **Measurement**: Bob measures with random bases
4. **Sifting**: Publicly compare bases, keep matching bits
5. **Error Detection**: Calculate QBER to detect eavesdropping
6. **Key Generation**: Create final shared secret key

### Error Detection:
- **QBER Threshold**: 11% (configurable)
- **Above Threshold**: Eavesdropping detected, restart required
- **Below Threshold**: Secure key can be generated

## Multi-Client Support

- Multiple users can join the same session from different devices
- Real-time synchronization of all protocol steps
- Online user indicator shows who's connected
- Session state persists across client connections

## Security Features

- **Quantum Bit Error Rate (QBER)** calculation
- **Eavesdropping detection** via error analysis
- **One-Time Pad encryption** with quantum-generated key
- **Perfect forward secrecy** (new key for each session)

## Development

### Project Structure
```
bb84-simulation/
├── src/                    # Frontend React app
│   ├── components/         # UI components
│   ├── lib/               # Utilities and BB84 logic
│   ├── types/             # TypeScript definitions
│   └── pages/             # Application pages
├── backend/               # Node.js server
│   ├── server.js          # Socket.IO server
│   └── package.json       # Backend dependencies
└── README.md
```

### Available Scripts

#### Frontend
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build

#### Backend
- `npm run dev`: Start with nodemon (auto-restart)
- `npm start`: Start production server

## Educational Value

This simulation demonstrates:
- **Quantum Key Distribution** principles
- **Information-theoretic security** concepts
- **Eavesdropping detection** in quantum systems
- **One-Time Pad** perfect encryption
- **Real-time collaborative protocols**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is for educational purposes and demonstrates quantum cryptography concepts.

---

**Note**: This is a simulation for learning purposes. Real quantum key distribution requires actual quantum hardware and photon-based communication channels.