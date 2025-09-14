import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface QuantumPhotonProps {
  isMoving: boolean;
  onComplete?: () => void;
}

export const QuantumPhoton = ({ isMoving, onComplete }: QuantumPhotonProps) => {
  return (
    <motion.div
      className="relative flex items-center justify-center"
      initial={{ x: -100, scale: 0, opacity: 0 }}
      animate={isMoving ? { x: 100, scale: 1, opacity: 1 } : { x: -100, scale: 0, opacity: 0 }}
      transition={{ 
        duration: 2, 
        ease: "easeInOut",
        scale: { delay: 0.2 }
      }}
      onAnimationComplete={onComplete}
    >
      <motion.div
        className="relative"
        animate={isMoving ? { rotate: 360 } : { rotate: 0 }}
        transition={{ 
          duration: 2, 
          ease: "linear", 
          repeat: isMoving ? Infinity : 0 
        }}
      >
        <Zap className="w-6 h-6 text-primary quantum-glow" />
        <motion.div
          className="absolute -inset-2 bg-primary/20 rounded-full blur-sm"
          animate={isMoving ? { scale: [1, 1.5, 1] } : { scale: 1 }}
          transition={{ 
            duration: 1, 
            repeat: isMoving ? Infinity : 0,
            ease: "easeInOut"
          }}
        />
      </motion.div>
      
      {/* Particle trail */}
      {isMoving && (
        <motion.div
          className="absolute w-20 h-0.5 bg-gradient-to-r from-primary via-accent to-transparent"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: -40, opacity: [0, 1, 0] }}
          transition={{ 
            duration: 0.5, 
            repeat: Infinity,
            ease: "linear" 
          }}
        />
      )}
    </motion.div>
  );
};