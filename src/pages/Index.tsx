import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoleSelector } from '@/components/RoleSelector';
import { AliceInterface } from '@/components/AliceInterface';
import { BobInterface } from '@/components/BobInterface';
import { EveInterface } from '@/components/EveInterface';
import { OTPInterface } from '@/components/OTPInterface';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BB84Session } from '@/types/bb84';
import { connectSocket, getSocket } from '@/lib/socket';
import { LogOut, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [userRole, setUserRole] = useState<'alice' | 'bob' | 'eve' | null>(null);
  const [session, setSession] = useState<BB84Session | null>(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const socket = connectSocket();

    socket.on('connect', () => {
      setConnected(true);
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from server');
    });

    socket.on('session_updated', (updatedSession: BB84Session) => {
      setSession(updatedSession);
    });

    socket.on('users_updated', (users: string[]) => {
      setOnlineUsers(users);
    });

    socket.on('error', (error: any) => {
      toast({
        title: "Connection Error",
        description: error.message || "Failed to connect to server",
        variant: "destructive",
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [toast]);

  const handleRoleSelect = (role: 'alice' | 'bob' | 'eve') => {
    setUserRole(role);
    const socket = getSocket();
    socket.emit('join_session', { role });
    
    toast({
      title: "Joined Session",
      description: `You are now ${role.toUpperCase()}`,
      variant: "default",
    });
  };

  const handleLeaveSession = () => {
    setUserRole(null);
    setSession(null);
    const socket = getSocket();
    socket.emit('leave_session');
    
    toast({
      title: "Left Session",
      description: "You have left the quantum simulation",
      variant: "default",
    });
  };

  if (!userRole) {
    return <RoleSelector onRoleSelect={handleRoleSelect} />;
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-6"
      >
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-foreground quantum-glow">
            BB84 Protocol Simulation
          </h1>
          <Badge variant={connected ? 'default' : 'destructive'}>
            {connected ? (
              <><Wifi className="w-3 h-3 mr-1" /> Connected</>
            ) : (
              <><WifiOff className="w-3 h-3 mr-1" /> Disconnected</>
            )}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Online:</span>
            {onlineUsers.map((user) => (
              <Badge key={user} variant="secondary" className="text-xs">
                {user}
              </Badge>
            ))}
          </div>
          <Button 
            onClick={handleLeaveSession}
            variant="outline"
            size="sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Leave Session
          </Button>
        </div>
      </motion.div>

      {/* Main Interface */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Role-specific Interface */}
        <AnimatePresence mode="wait">
          <motion.div
            key={userRole}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {userRole === 'alice' && (
              <AliceInterface 
                session={session} 
                onSessionUpdate={setSession} 
              />
            )}
            {userRole === 'bob' && (
              <BobInterface 
                session={session} 
                onSessionUpdate={setSession} 
              />
            )}
            {userRole === 'eve' && (
              <EveInterface 
                session={session} 
                onSessionUpdate={setSession} 
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* OTP Interface (for Alice and Bob only) */}
        {(userRole === 'alice' || userRole === 'bob') && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <OTPInterface 
              session={session} 
              userRole={userRole} 
            />
          </motion.div>
        )}
      </div>

      {/* Session Status Footer */}
      {session && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-4 quantum-border rounded-lg"
        >
          <div className="flex justify-between items-center text-sm">
            <div className="flex gap-6">
              <div>
                <span className="text-muted-foreground">Session ID:</span>
                <span className="ml-2 font-mono">{session.id}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Phase:</span>
                <Badge className="ml-2">{session.phase}</Badge>
              </div>
              {session.qber > 0 && (
                <div>
                  <span className="text-muted-foreground">QBER:</span>
                  <Badge 
                    variant={session.qber >= session.threshold ? 'destructive' : 'default'}
                    className="ml-2"
                  >
                    {(session.qber * 100).toFixed(2)}%
                  </Badge>
                </div>
              )}
            </div>
            <div>
              <span className="text-muted-foreground">Threshold:</span>
              <span className="ml-2">{(session.threshold * 100).toFixed(1)}%</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Index;
