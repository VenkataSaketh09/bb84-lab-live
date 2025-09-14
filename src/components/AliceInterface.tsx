import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuantumPhoton } from '@/components/QuantumPhoton';
import { generateQuantumBits, encodePhoton } from '@/lib/bb84';
import { QuantumBit, BB84Session } from '@/types/bb84';
import { getSocket } from '@/lib/socket';
import { Zap, Send, Key, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AliceInterfaceProps {
  session: BB84Session | null;
  onSessionUpdate: (session: BB84Session) => void;
}

export const AliceInterface = ({ session, onSessionUpdate }: AliceInterfaceProps) => {
  const [bits, setBits] = useState<QuantumBit[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showPhotons, setShowPhotons] = useState(false);
  const { toast } = useToast();
  const socket = getSocket();

  const generateBits = async () => {
    setIsGenerating(true);
    // Simulate quantum bit generation with delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newBits = generateQuantumBits(20);
    setBits(newBits);
    setIsGenerating(false);
    
    toast({
      title: "Quantum Bits Generated",
      description: `Generated ${newBits.length} quantum bits`,
      variant: "default",
    });
  };

  const sendToBob = () => {
    if (bits.length === 0) return;
    
    setIsSending(true);
    setShowPhotons(true);
    
    const photons = bits.map(bit => encodePhoton(bit.bit, bit.basis));
    
    socket.emit('alice_send_photons', { photons });
    
    setTimeout(() => {
      setShowPhotons(false);
      setIsSending(false);
      toast({
        title: "Photons Sent Successfully",
        description: "Quantum information transmitted to Bob",
        variant: "default",
      });
    }, 2000);
  };

  const compareBases = () => {
    socket.emit('alice_compare_bases', { bits });
  };

  const checkQBER = () => {
    socket.emit('alice_check_qber');
  };

  const generateFinalKey = () => {
    socket.emit('alice_generate_final_key');
  };

  const restart = () => {
    setBits([]);
    socket.emit('restart_session');
  };

  useEffect(() => {
    socket.on('session_updated', onSessionUpdate);
    return () => {
      socket.off('session_updated');
    };
  }, [onSessionUpdate]);

  return (
    <Card className="p-6 quantum-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-lg">A</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Alice</h2>
          <p className="text-muted-foreground">Quantum Key Sender</p>
        </div>
      </div>

      {/* Bit Generation */}
      <div className="space-y-4">
        <Button 
          onClick={generateBits}
          disabled={isGenerating}
          variant="quantum"
          className="w-full"
        >
          {isGenerating ? (
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="w-4 h-4" />
            </motion.div>
          ) : (
            <Zap className="w-4 h-4" />
          )}
          {isGenerating ? 'Generating Quantum Bits...' : 'Generate Random Bits + Bases'}
        </Button>

        {bits.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 quantum-border rounded-lg"
          >
            <p className="text-sm text-muted-foreground mb-2">Generated {bits.length} quantum bits</p>
            <div className="grid grid-cols-10 gap-1">
              {bits.slice(0, 20).map((bit, index) => (
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

        {/* Photon Animation Area */}
        <AnimatePresence>
          {showPhotons && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 80 }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-center bg-muted/20 rounded-lg overflow-hidden"
            >
              <QuantumPhoton isMoving={showPhotons} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-3">
          <Button 
            onClick={sendToBob}
            disabled={bits.length === 0 || isSending}
            variant="photon"
          >
            <Send className="w-4 h-4" />
            Send to Bob
          </Button>

          {session?.phase === 'transmission' && (
            <Button 
              onClick={compareBases}
              variant="default"
            >
              <Key className="w-4 h-4" />
              Compare Bases
            </Button>
          )}

          {session?.phase === 'sifting' && (
            <Button 
              onClick={checkQBER}
              variant="warning"
            >
              <AlertTriangle className="w-4 h-4" />
              Check QBER
            </Button>
          )}

          {session?.phase === 'error_check' && session.qber < session.threshold && (
            <Button 
              onClick={generateFinalKey}
              variant="success"
            >
              <CheckCircle className="w-4 h-4" />
              Generate Final Key
            </Button>
          )}

          {session?.qber >= session?.threshold && (
            <Button 
              onClick={restart}
              variant="destructive"
            >
              Restart Session
            </Button>
          )}
        </div>

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
            {session.alice.finalKey.length > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Final Key Length:</span>
                <Badge variant="default">{session.alice.finalKey.length} bits</Badge>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </Card>
  );
};