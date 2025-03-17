
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

export function usePolar() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [lastWithdrawalStatus, setLastWithdrawalStatus] = useState<'success' | 'failed' | null>(null);

  // Polar API key - safe to include as it's a public client-side key
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
    setLastWithdrawalStatus(null);
    
    try {
      // Simulate API call to Polar for direct transfer
      // In production, this would call your backend that securely interacts with Polar's API
      
      // Generate a unique withdrawal ID
      const withdrawalId = `polar-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Create a record of the transaction
      const newWithdrawal = {
        id: withdrawalId,
        amount: amount,
        email: email,
        date: new Date().toISOString(),
        status: "completed", // Simulate successful withdrawal
        method: "Polar",
        reference: `TR-${withdrawalId.substring(0, 8)}`
      };
      
      // For simulation purposes, add a delay to mimic API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store the withdrawal record
      const existingWithdrawals = JSON.parse(localStorage.getItem("withdrawals") || "[]");
      existingWithdrawals.push(newWithdrawal);
      localStorage.setItem("withdrawals", JSON.stringify(existingWithdrawals));
      
      toast({
        title: "Withdrawal Successful",
        description: `$${amount.toFixed(2)} has been transferred to your Polar account (${email}).`,
        variant: "default",
      });
      
      setLastWithdrawalStatus('success');
      setIsLoading(false);
      return { success: true, id: withdrawalId, reference: newWithdrawal.reference };
    } catch (error) {
      let message = "Failed to process withdrawal";
      if (error instanceof Error) {
        message = error.message;
      }
      
      console.error("Polar withdrawal error:", error);
      setError(message);
      setLastWithdrawalStatus('failed');
      
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
    lastWithdrawalStatus,
    POLAR_API_KEY
  };
}
