import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User, Atom, Eye } from 'lucide-react';

interface RoleSelectorProps {
  onRoleSelect: (role: 'alice' | 'bob' | 'eve') => void;
}

export const RoleSelector = ({ onRoleSelect }: RoleSelectorProps) => {
  const roles = [
    {
      id: 'alice' as const,
      name: 'Alice',
      description: 'Quantum Key Sender',
      icon: User,
      color: 'primary',
    },
    {
      id: 'bob' as const,
      name: 'Bob',
      description: 'Quantum Key Receiver',
      icon: Atom,
      color: 'accent',
    },
    {
      id: 'eve' as const,
      name: 'Eve',
      description: 'Quantum Eavesdropper',
      icon: Eye,
      color: 'destructive',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-4 quantum-glow">
            BB84 Quantum Key Distribution
          </h1>
          <p className="text-xl text-muted-foreground">
            Select your role to join the quantum communication simulation
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role, index) => {
            const IconComponent = role.icon;
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 quantum-card hover:scale-105 transition-all duration-300 cursor-pointer"
                      onClick={() => onRoleSelect(role.id)}>
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                      role.color === 'primary' ? 'bg-primary' :
                      role.color === 'accent' ? 'bg-accent' : 'bg-destructive'
                    }`}>
                      <IconComponent className={`w-8 h-8 ${
                        role.color === 'primary' ? 'text-primary-foreground' :
                        role.color === 'accent' ? 'text-accent-foreground' : 'text-destructive-foreground'
                      }`} />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">{role.name}</h3>
                    <p className="text-muted-foreground mb-4">{role.description}</p>
                    <Button 
                      variant={role.color === 'primary' ? 'quantum' : 
                              role.color === 'accent' ? 'default' : 'destructive'}
                      className="w-full"
                    >
                      Join as {role.name}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Multiple users can join from different devices to simulate real quantum communication
          </p>
        </motion.div>
      </div>
    </div>
  );
};