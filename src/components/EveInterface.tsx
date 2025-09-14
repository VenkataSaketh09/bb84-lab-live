import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { BB84Session } from '@/types/bb84';
import { getSocket } from '@/lib/socket';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EveInterfaceProps {
  session: BB84Session | null;
  onSessionUpdate: (session: BB84Session) => void;
}

export const EveInterface = ({ session, onSessionUpdate }: EveInterfaceProps) => {
  const [isEavesdropping, setIsEavesdropping] = useState(false);
  const [interceptedCount, setInterceptedCount] = useState(0);
  const { toast } = useToast();
  const socket = getSocket();

  const toggleEavesdropping = () => {
    const newState = !isEavesdropping;
    setIsEavesdropping(newState);
    socket.emit('eve_toggle_eavesdropping', { active: newState });
    
    if (newState) {
      toast({
        title: "Eavesdropping Activated",
        description: "Eve is now intercepting quantum communications",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Eavesdropping Deactivated",
        description: "Eve stopped intercepting",
        variant: "default",
      });
    }
  };

  useEffect(() => {
    socket.on('eve_intercepted', (data: { count: number }) => {
      setInterceptedCount(data.count);
    });

    socket.on('session_updated', onSessionUpdate);

    return () => {
      socket.off('eve_intercepted');
      socket.off('session_updated');
    };
  }, [onSessionUpdate]);

  return (
    <Card className="p-6 quantum-card border-destructive/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-destructive rounded-full flex items-center justify-center">
          <span className="text-destructive-foreground font-bold text-lg">E</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Eve</h2>
          <p className="text-muted-foreground">Quantum Eavesdropper</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 quantum-border rounded-lg">
          <div className="flex items-center gap-3">
            {isEavesdropping ? (
              <Eye className="w-5 h-5 text-destructive" />
            ) : (
              <EyeOff className="w-5 h-5 text-muted-foreground" />
            )}
            <span className="font-medium">Intercept Communications</span>
          </div>
          <Switch 
            checked={isEavesdropping}
            onCheckedChange={toggleEavesdropping}
          />
        </div>

        {isEavesdropping && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-5 h-5 text-destructive" />
              </motion.div>
              <span className="font-medium text-destructive">Active Eavesdropping</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Intercepting and measuring quantum photons. This will introduce errors and increase QBER.
            </p>
          </motion.div>
        )}

        {interceptedCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 quantum-border rounded-lg"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Photons Intercepted:</span>
              <Badge variant="destructive">{interceptedCount}</Badge>
            </div>
          </motion.div>
        )}

        {/* Status Display */}
        {session && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 quantum-border rounded-lg space-y-2"
          >
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Session Phase:</span>
              <Badge>{session.phase}</Badge>
            </div>
            {session.qber > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">QBER Detected:</span>
                <Badge variant={session.qber >= session.threshold ? 'destructive' : 'default'}>
                  {(session.qber * 100).toFixed(2)}%
                </Badge>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant={session.eve.active ? 'destructive' : 'secondary'}>
                {session.eve.active ? 'Intercepting' : 'Passive'}
              </Badge>
            </div>
          </motion.div>
        )}

        {session?.qber >= session?.threshold && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-success/10 border border-success/20 rounded-lg text-center"
          >
            <p className="text-success font-medium">Eavesdropping Detected!</p>
            <p className="text-sm text-muted-foreground mt-1">
              High error rate indicates quantum channel compromise
            </p>
          </motion.div>
        )}
      </div>
    </Card>
  );
};