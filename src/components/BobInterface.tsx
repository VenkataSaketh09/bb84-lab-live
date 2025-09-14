import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generateRandomBasis, measurePhoton } from '@/lib/bb84';
import { PhotonPacket, BB84Session, QuantumBit } from '@/types/bb84';
import { getSocket } from '@/lib/socket';
import { Atom, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BobInterfaceProps {
  session: BB84Session | null;
  onSessionUpdate: (session: BB84Session) => void;
}

export const BobInterface = ({ session, onSessionUpdate }: BobInterfaceProps) => {
  const [receivedPhotons, setReceivedPhotons] = useState<PhotonPacket[]>([]);
  const [measurements, setMeasurements] = useState<QuantumBit[]>([]);
  const [isReceiving, setIsReceiving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();
  const socket = getSocket();

  const receivePhotons = () => {
    socket.emit('bob_ready_to_receive');
  };

  useEffect(() => {
    socket.on('photons_received', (data: { photons: PhotonPacket[] }) => {
      setIsReceiving(true);
      setReceivedPhotons(data.photons);
      
      // Simulate measurement process
      const newMeasurements: QuantumBit[] = [];
      data.photons.forEach((photon, index) => {
        setTimeout(() => {
          const measurementBasis = generateRandomBasis();
          const result = measurePhoton(photon, measurementBasis);
          newMeasurements.push({
            bit: result.bit,
            basis: measurementBasis,
          });
          
          if (index === data.photons.length - 1) {
            setMeasurements([...newMeasurements]);
            setIsReceiving(false);
            socket.emit('bob_measurements_complete', { measurements: newMeasurements });
            toast({
              title: "Photons Received",
              description: `Measured ${data.photons.length} photons`,
              variant: "default",
            });
          }
        }, index * 100);
      });
    });

    socket.on('sifted_key_ready', (data: { bobKey: number[] }) => {
      setProcessing(false);
      toast({
        title: "Key Sifting Complete",
        description: `Sifted key contains ${data.bobKey.length} bits`,
        variant: "default",
      });
    });

    socket.on('session_updated', (updatedSession: BB84Session) => {
      onSessionUpdate(updatedSession);
      if (updatedSession.phase === 'sifting') {
        setProcessing(true);
      }
    });

    return () => {
      socket.off('photons_received');
      socket.off('sifted_key_ready');
      socket.off('session_updated');
    };
  }, [onSessionUpdate, toast]);

  return (
    <Card className="p-6 quantum-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
          <span className="text-accent-foreground font-bold text-lg">B</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Bob</h2>
          <p className="text-muted-foreground">Quantum Key Receiver</p>
        </div>
      </div>

      <div className="space-y-4">
        <Button 
          onClick={receivePhotons}
          disabled={isReceiving}
          variant="quantum"
          className="w-full"
        >
          {isReceiving ? (
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }} 
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Atom className="w-4 h-4" />
            </motion.div>
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isReceiving ? 'Receiving Photons...' : 'Receive Photons'}
        </Button>

        {/* Receiving Animation */}
        <AnimatePresence>
          {isReceiving && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 100 }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-muted/20 rounded-lg p-4 flex items-center justify-center"
            >
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 10 }).map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-3 h-3 bg-primary rounded-full quantum-glow"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Measurements Display */}
        {measurements.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 quantum-border rounded-lg"
          >
            <p className="text-sm text-muted-foreground mb-2">Measured {measurements.length} bits</p>
            <div className="grid grid-cols-10 gap-1">
              {measurements.slice(0, 20).map((bit, index) => (
                <Badge 
                  key={index}
                  variant={bit.basis === 'rectilinear' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {bit.bit}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}

        {/* Processing Animation */}
        <AnimatePresence>
          {processing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 text-center quantum-border rounded-lg"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-2"
              >
                <Atom className="w-6 h-6 text-primary" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Processing quantum key...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Display */}
        {session && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 quantum-border rounded-lg space-y-2"
          >
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Phase:</span>
              <Badge>{session.phase}</Badge>
            </div>
            {session.qber > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">QBER:</span>
                <Badge variant={session.qber >= session.threshold ? 'destructive' : 'default'}>
                  {(session.qber * 100).toFixed(2)}%
                </Badge>
              </div>
            )}
            {session.bob.siftedKey.length > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Sifted Key Length:</span>
                <Badge>{session.bob.siftedKey.length} bits</Badge>
              </div>
            )}
            {session.bob.finalKey.length > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Final Key Length:</span>
                <Badge variant="default">{session.bob.finalKey.length} bits</Badge>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </Card>
  );
};