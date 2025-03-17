
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

export function usePolar() {
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

  const connectPolarWithEmail = (email: string) => {
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
      title: "Polar Account Connected",
      description: `Your payment account (${email}) has been successfully connected`,
    });
    
    return true;
  };

  const processWithdrawal = async (amount: number, email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Direct transfer to Polar account without checkout
      // In a real implementation, this would call a secure backend API
      
      const withdrawalId = Date.now().toString();
      const newWithdrawal = {
        id: withdrawalId,
        amount: amount,
        email: email,
        date: new Date().toISOString(),
        status: "completed" // Simulate successful withdrawal
      };
      
      // Store the withdrawal record
      const existingWithdrawals = JSON.parse(localStorage.getItem("withdrawals") || "[]");
      existingWithdrawals.push(newWithdrawal);
      localStorage.setItem("withdrawals", JSON.stringify(existingWithdrawals));
      
      toast({
        title: "Withdrawal Successful",
        description: `$${amount.toFixed(2)} has been transferred to your Polar account (${email}).`,
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

  return {
    isConnected: () => isConnected,
    getConnectedEmail: () => connectedEmail,
    connectPolarWithEmail,
    processWithdrawal,
    isLoading,
    error,
    POLAR_API_KEY
  };
}
