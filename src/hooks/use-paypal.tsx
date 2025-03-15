
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

// PayPal server endpoint - production or test URL based on environment
const PAYPAL_SERVER_URL = import.meta.env.VITE_PAYPAL_SERVER_URL || "http://localhost:3000";

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

  // Connect to PayPal
  const connectPayPal = () => {
    // Log the connection attempt
    console.log("Attempting to connect to PayPal at URL:", PAYPAL_SERVER_URL);
    
    // Prepare the full URL with connect flag
    const connectUrl = new URL(PAYPAL_SERVER_URL);
    connectUrl.searchParams.append('connect', 'true');
    
    // Redirect to the PayPal OAuth page
    window.location.href = connectUrl.toString();
  };

  // Process withdrawal
  const processWithdrawal = async (amount: number, email: string) => {
    setIsLoading(true);
    setError(null);
    
    console.log("Processing withdrawal:", { amount, email, url: `${PAYPAL_SERVER_URL}/withdraw` });
    
    try {
      // First, create a no-cors request to wake up the server if it's sleeping
      try {
        await fetch(PAYPAL_SERVER_URL, { 
          method: "GET", 
          mode: "no-cors" 
        });
      } catch (e) {
        console.log("Wake-up ping completed");
      }
      
      // Now attempt the actual withdrawal
      const response = await fetch(`${PAYPAL_SERVER_URL}/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, amount })
      });
      
      if (!response.ok) {
        let errorMessage = "Withdrawal failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If the response is not JSON, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      toast({
        title: "Withdrawal Successful",
        description: `₹${amount.toFixed(2)} has been sent to your PayPal account`,
      });
      
      setIsLoading(false);
      return data;
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

  return {
    isConnected: () => isConnected,
    getConnectedEmail: () => connectedEmail,
    connectPayPal,
    processWithdrawal,
    isLoading,
    error
  };
}
