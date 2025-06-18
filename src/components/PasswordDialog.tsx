
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPasswordSubmit: (password: string) => void;
}

const PasswordDialog: React.FC<PasswordDialogProps> = ({ open, onOpenChange, onPasswordSubmit }) => {
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPasswordSubmit(password);
    setPassword(''); // נקה את השדה לאחר השליחה
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setPassword(''); // נקה את השדה כשסוגרים את הדיאלוג
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-right">נדרשת סיסמא</DialogTitle>
            <DialogDescription className="text-right">
              כדי להשתמש במעצב הדירות, אנא הכנס את הסיסמא.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="סיסמא"
              className="text-right"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!password.trim()}>
              כניסה
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordDialog;
