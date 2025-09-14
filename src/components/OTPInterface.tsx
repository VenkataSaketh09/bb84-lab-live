import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { oneTimePadEncrypt, oneTimePadDecrypt } from '@/lib/bb84';
import { BB84Session, OTPMessage } from '@/types/bb84';
import { getSocket } from '@/lib/socket';
import { Lock, Unlock, Send, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OTPInterfaceProps {
  session: BB84Session | null;
  userRole: 'alice' | 'bob';
}

export const OTPInterface = ({ session, userRole }: OTPInterfaceProps) => {
  const [message, setMessage] = useState('');
  const [receivedCiphertext, setReceivedCiphertext] = useState('');
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const [sentMessages, setSentMessages] = useState<OTPMessage[]>([]);
  const [receivedMessages, setReceivedMessages] = useState<OTPMessage[]>([]);
  const { toast } = useToast();
  const socket = getSocket();

  const canUseOTP = session?.phase === 'complete' && 
                   session.alice.finalKey.length > 0 && 
                   session.bob.finalKey.length > 0;

  const finalKey = userRole === 'alice' ? session?.alice.finalKey || [] : session?.bob.finalKey || [];

  const encryptAndSend = () => {
    if (!message.trim() || !canUseOTP) return;

    const encrypted = oneTimePadEncrypt(message, finalKey);
    const otpMessage: OTPMessage = {
      id: Math.random().toString(36).substr(2, 9),
      from: userRole,
      to: userRole === 'alice' ? 'bob' : 'alice',
      plaintext: message,
      ciphertext: encrypted,
      timestamp: Date.now(),
    };

    socket.emit('otp_message_sent', otpMessage);
    setSentMessages(prev => [...prev, otpMessage]);
    setMessage('');
    
    toast({
      title: "Message Encrypted & Sent",
      description: "Secure message transmitted using quantum key",
      variant: "default",
    });
  };

  const decryptMessage = () => {
    if (!receivedCiphertext || !canUseOTP) return;

    const decrypted = oneTimePadDecrypt(receivedCiphertext, finalKey);
    setDecryptedMessage(decrypted);
    
    toast({
      title: "Message Decrypted",
      description: "Successfully decrypted using quantum key",
      variant: "default",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Text copied successfully",
      variant: "default",
    });
  };

  useEffect(() => {
    socket.on('otp_message_received', (otpMessage: OTPMessage) => {
      if (otpMessage.to === userRole) {
        setReceivedMessages(prev => [...prev, otpMessage]);
        setReceivedCiphertext(otpMessage.ciphertext);
        toast({
          title: "Encrypted Message Received",
          description: `New message from ${otpMessage.from.toUpperCase()}`,
          variant: "default",
        });
      }
    });

    return () => {
      socket.off('otp_message_received');
    };
  }, [userRole, toast]);

  return (
    <Card className="p-6 quantum-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
          <Lock className="w-5 h-5 text-success-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">One-Time Pad</h2>
          <p className="text-muted-foreground">Quantum-Secured Communication</p>
        </div>
      </div>

      {!canUseOTP && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-warning/10 border border-warning/20 rounded-lg mb-4 text-center"
        >
          <Lock className="w-8 h-8 mx-auto mb-2 text-warning" />
          <p className="text-warning font-medium">Waiting for Final Quantum Key</p>
          <p className="text-sm text-muted-foreground">
            Complete the BB84 protocol to enable secure communication
          </p>
        </motion.div>
      )}

      <div className="space-y-6">
        {/* Key Status */}
        {canUseOTP && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-success/10 border border-success/20 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <Unlock className="w-5 h-5 text-success" />
              <span className="font-medium text-success">Quantum Key Ready</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Key Length:</span>
              <Badge variant="default">{finalKey.length} bits</Badge>
            </div>
          </motion.div>
        )}

        {/* Send Message */}
        <div className="space-y-3">
          <Label htmlFor="message">Send Encrypted Message</Label>
          <Textarea
            id="message"
            placeholder={canUseOTP ? "Type your secret message here..." : "Complete BB84 protocol first"}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!canUseOTP}
            className="quantum-border"
          />
          <Button 
            onClick={encryptAndSend}
            disabled={!message.trim() || !canUseOTP}
            variant="quantum"
            className="w-full"
          >
            <Send className="w-4 h-4" />
            Encrypt & Send
          </Button>
        </div>

        {/* Receive & Decrypt */}
        <div className="space-y-3">
          <Label htmlFor="received">Received Encrypted Message</Label>
          <div className="flex gap-2">
            <Input
              id="received"
              placeholder="Encrypted message will appear here..."
              value={receivedCiphertext}
              onChange={(e) => setReceivedCiphertext(e.target.value)}
              disabled={!canUseOTP}
              className="quantum-border flex-1"
            />
            <Button
              onClick={() => copyToClipboard(receivedCiphertext)}
              disabled={!receivedCiphertext}
              variant="outline"
              size="icon"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <Button 
            onClick={decryptMessage}
            disabled={!receivedCiphertext || !canUseOTP}
            variant="success"
            className="w-full"
          >
            <Unlock className="w-4 h-4" />
            Decrypt Message
          </Button>
        </div>

        {/* Decrypted Message */}
        {decryptedMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <Label>Decrypted Message</Label>
            <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
              <p className="text-foreground">{decryptedMessage}</p>
            </div>
          </motion.div>
        )}

        {/* Message History */}
        {(sentMessages.length > 0 || receivedMessages.length > 0) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <Label>Message History</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {[...sentMessages, ...receivedMessages]
                .sort((a, b) => a.timestamp - b.timestamp)
                .map((msg) => (
                  <div 
                    key={msg.id}
                    className={`p-3 rounded-lg text-sm ${
                      msg.from === userRole 
                        ? 'bg-primary/10 border border-primary/20 ml-8' 
                        : 'bg-accent/10 border border-accent/20 mr-8'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <Badge variant={msg.from === userRole ? 'default' : 'secondary'}>
                        {msg.from === userRole ? 'Sent' : 'Received'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-foreground">{msg.plaintext}</p>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  );
};