
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";

// PayPal server endpoint
const PAYPAL_SERVER_URL = "http://localhost:3000";

export function usePaypal() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if PayPal is connected
  const isConnected = () => {
    return localStorage.getItem("paypal_email") !== null;
  };

  // Get connected PayPal email
  const getConnectedEmail = () => {
    return localStorage.getItem("paypal_email");
  };

  // Connect to PayPal
  const connectPayPal = () => {
    window.location.href = `${PAYPAL_SERVER_URL}/?connect=true`;
  };

  // Process withdrawal
  const processWithdrawal = async (amount: number, email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${PAYPAL_SERVER_URL}/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, amount })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Withdrawal failed");
      }
      
      const data = await response.json();
      
      toast({
        title: "Withdrawal Successful",
        description: `$${amount.toFixed(2)} has been sent to your PayPal account`,
      });
      
      setIsLoading(false);
      return data;
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
    isConnected,
    getConnectedEmail,
    connectPayPal,
    processWithdrawal,
    isLoading,
    error
  };
}
