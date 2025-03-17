
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Check } from 'lucide-react';

interface PolarSettingsProps {
  polarEmail: string;
  setPolarEmail: (email: string) => void;
  handlePolarUpdate: () => void;
  polar: any;
}

export const PolarSettings: React.FC<PolarSettingsProps> = ({ 
  polarEmail, 
  setPolarEmail, 
  handlePolarUpdate,
  polar
}) => {
  return (
    <div className="space-y-6 max-w-md">
      {!polar.isConnected() ? (
        <div className="space-y-4">
          <h3 className="font-medium">Connect Your Polar Account</h3>
          <p className="text-sm text-gray-600">
            Enter your email address to enable instant withdrawals to your Polar account.
          </p>
          <div className="flex flex-col space-y-2">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={polarEmail}
              onChange={(e) => setPolarEmail(e.target.value)}
              className="w-full"
            />
            <Button
              onClick={handlePolarUpdate}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Connect Polar Account
            </Button>
          </div>
          
          {polar.error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>
                There was an error connecting to Polar. Please try again later.
              </AlertDescription>
            </Alert>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Check className="h-5 w-5 text-green-500" />
            <span className="font-medium">Polar Account Connected</span>
          </div>
          <p className="text-sm text-gray-600">
            Your Polar account ({polar.getConnectedEmail()}) is connected for instant withdrawals.
          </p>
          <div className="flex flex-col space-y-2">
            <Input
              type="email"
              placeholder="Update email address"
              value={polarEmail}
              onChange={(e) => setPolarEmail(e.target.value)}
              className="w-full"
            />
            <Button
              onClick={handlePolarUpdate}
              variant="outline"
              className="px-4 py-2"
            >
              Update Email
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-md">
        <h3 className="font-medium mb-2">Polar Payment Integration</h3>
        <p className="text-sm">
          Your earnings can be withdrawn directly to your Polar account.
          Make sure your email is connected to avoid delays.
        </p>
        <p className="text-sm mt-2">
          <strong>API Key:</strong> {polar.POLAR_API_KEY.substring(0, 10)}...
        </p>
      </div>
    </div>
  );
};
