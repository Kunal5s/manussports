
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

// PayPal server endpoint
const PAYPAL_CLIENT_ID = "AYRQN-xtLD7K-YSI8s17Dn-Fa-ZED3Yckdk9Yg7fwcUnkjASV1IpVkTOPsFv5qcpRtKm8Y3ts8H5IqK_";
// Fallback to localhost for development
const PAYPAL_SERVER_URL = import.meta.env.VITE_PAYPAL_SERVER_URL || "https://api-m.paypal.com";

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
    console.log("Attempting to connect to PayPal");
    
    // Prepare the PayPal OAuth URL - using direct PayPal URL since we have the client ID
    const redirectUri = encodeURIComponent(window.location.origin + "/admin/wallet");
    const paypalConnectUrl = `https://www.paypal.com/connect?flowEntry=static&client_id=${PAYPAL_CLIENT_ID}&scope=openid email profile&redirect_uri=${redirectUri}`;
    
    // Redirect to the PayPal OAuth page
    window.location.href = paypalConnectUrl;
  };

  // Process withdrawal
  const processWithdrawal = async (amount: number, email: string) => {
    setIsLoading(true);
    setError(null);
    
    console.log("Processing withdrawal:", { amount, email });
    
    try {
      // Simulate successful API call for demonstration
      // In production, this would call your server endpoint
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
        description: `$${amount.toFixed(2)} has been sent to your PayPal account`,
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
    processWithdrawal,
    handlePayPalCallback,
    isLoading,
    error
  };
}
