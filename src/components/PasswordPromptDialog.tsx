
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PasswordPromptDialogProps {
  isOpen: boolean;
  onConfirm: (password: string) => void;
  onCancel: () => void;
  title?: string;
  confirmText?: string;
}

const PasswordPromptDialog: React.FC<PasswordPromptDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title = "הכנס סיסמה",
  confirmText = "אישור"
}) => {
  const [password, setPassword] = useState("");

  const handleConfirm = () => {
    onConfirm(password);
    setPassword("");
  };

  const handleClose = () => {
    onCancel();
    setPassword("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xs" dir="rtl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleClose}>ביטול</Button>
          <Button onClick={handleConfirm}>{confirmText}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordPromptDialog;
