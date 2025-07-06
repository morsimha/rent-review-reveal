
// This component is no longer needed - using proper Supabase authentication instead
import React from 'react';

interface PasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPasswordSubmit: (password: string) => void;
}

const PasswordDialog: React.FC<PasswordDialogProps> = () => {
  // This component is deprecated and no longer used
  return null;
};

export default PasswordDialog;
