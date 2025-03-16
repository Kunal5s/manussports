import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

export function usePaypal() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);

  // Check localStorage for PayPal connection on component mount
  useEffect(() => {
    const storedEmail = localStorage.getItem("paypal_email");
    if (storedEmail) {
      setIsConnected(true);
      setConnectedEmail(storedEmail);
    }
  }, []);

  // Connect to PayPal directly with email
  const connectPayPalWithEmail = (email: string) => {
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }
    
    // Store the email in localStorage
    localStorage.setItem("paypal_email", email);
    setIsConnected(true);
    setConnectedEmail(email);
    
    toast({
      title: "PayPal Connected",
      description: `Your PayPal account (${email}) has been successfully connected`,
    });
    
    return true;
  };

  // Legacy OAuth connect method - keeping for backwards compatibility
  const connectPayPal = () => {
    toast({
      title: "PayPal Connection",
      description: "Please use email connection method instead of OAuth",
    });
    return false;
  };

  // Process withdrawal
  const processWithdrawal = async (amount: number, email: string) => {
    setIsLoading(true);
    setError(null);
    
    console.log("Processing withdrawal:", { amount, email });
    
    try {
      // Simulate successful API call for demonstration
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      // Store the withdrawal in localStorage
      const withdrawalId = Date.now().toString();
      const newWithdrawal = {
        id: withdrawalId,
        amount: amount,
        email: email,
        date: new Date().toISOString(),
        status: "completed"
      };
      
      // Store withdrawal in local storage for persistence
      const existingWithdrawals = JSON.parse(localStorage.getItem("withdrawals") || "[]");
      existingWithdrawals.push(newWithdrawal);
      localStorage.setItem("withdrawals", JSON.stringify(existingWithdrawals));
      
      toast({
        title: "Withdrawal Successful",
        description: `$${amount.toFixed(2)} has been sent to your PayPal account (${email})`,
      });
      
      setIsLoading(false);
      return { success: true, id: withdrawalId };
    } catch (error) {
      let message = "Failed to process withdrawal";
      if (error instanceof Error) {
        message = error.message;
      }
      
      console.error("PayPal Withdrawal Error:", message);
      
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

  // Handle PayPal callback (to be called after redirect from PayPal)
  const handlePayPalCallback = (code: string) => {
    // For demonstration, we'll just save a mock email
    const mockEmail = "user@example.com";
    localStorage.setItem("paypal_email", mockEmail);
    setIsConnected(true);
    setConnectedEmail(mockEmail);
    
    toast({
      title: "PayPal Connected",
      description: "Your PayPal account has been successfully connected",
    });
    
    return true;
  };

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
