import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

export function usePaypal() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);

  const POLAR_API_KEY = "polar_oat_RB4EfpKFQcRb0Dwd1KJW8DeGLv38fGJR6Q2b90i5gFu";

  useEffect(() => {
    const storedEmail = localStorage.getItem("polar_email");
    if (storedEmail) {
      setIsConnected(true);
      setConnectedEmail(storedEmail);
    }
  }, []);

  const connectPayPalWithEmail = (email: string) => {
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }
    
    localStorage.setItem("polar_email", email);
    setIsConnected(true);
    setConnectedEmail(email);
    
    toast({
      title: "Payment Account Connected",
      description: `Your payment account (${email}) has been successfully connected`,
    });
    
    return true;
  };

  const connectPayPal = () => {
    toast({
      title: "Payment Connection",
      description: "Please use email connection method instead",
    });
    return false;
  };

  const processWithdrawal = async (amount: number, email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const checkoutUrl = `https://buy.polar.sh/polar_cl_OzhOsPD8Lz5chrXlfFggMuFc1wiV36A1vmg3200VriH?amount=${amount * 100}&email=${encodeURIComponent(email)}`;
      
      window.open(checkoutUrl, '_blank');
      
      const withdrawalId = Date.now().toString();
      const newWithdrawal = {
        id: withdrawalId,
        amount: amount,
        email: email,
        date: new Date().toISOString(),
        status: "pending"
      };
      
      const existingWithdrawals = JSON.parse(localStorage.getItem("withdrawals") || "[]");
      existingWithdrawals.push(newWithdrawal);
      localStorage.setItem("withdrawals", JSON.stringify(existingWithdrawals));
      
      toast({
        title: "Withdrawal Process Started",
        description: `Checkout for $${amount.toFixed(2)} has been opened. Complete the process to receive your funds.`,
      });
      
      setIsLoading(false);
      return { success: true, id: withdrawalId };
    } catch (error) {
      let message = "Failed to process withdrawal";
      if (error instanceof Error) {
        message = error.message;
      }
      
      setError(message);
      toast({
        title: "Withdrawal Failed",
        description: message,
        variant: "destructive",
      });
      
      setIsLoading(false);
      throw error;
    }
  };

  const handlePayPalCallback = () => {
    return true;
  };

  useEffect(() => {
    const polarScript = document.createElement('script');
    polarScript.src = "https://cdn.jsdelivr.net/npm/@polar-sh/checkout@0.1/dist/embed.global.js";
    polarScript.defer = true;
    polarScript.setAttribute('data-auto-init', '');
    
    document.body.appendChild(polarScript);
    
    return () => {
      document.body.removeChild(polarScript);
    };
  }, []);

  return {
    isConnected: () => isConnected,
    getConnectedEmail: () => connectedEmail,
    connectPayPal,
    connectPayPalWithEmail,
    processWithdrawal,
    handlePayPalCallback,
    isLoading,
    error
  };
}
