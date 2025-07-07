
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

interface ParsedResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parsedResult: any;
}

const ParsedResultDialog: React.FC<ParsedResultDialogProps> = ({
  open,
  onOpenChange,
  parsedResult,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>פיענוח אוטומטי מהתמונה</DialogTitle>
          <DialogDescription>
            אלו הנתונים שחולצו ע"י OpenAI:
          </DialogDescription>
        </DialogHeader>
        <div dir="ltr" className="overflow-x-auto p-2 bg-gray-100 rounded border text-sm max-h-80">
          <pre className="whitespace-pre-wrap break-words">
            {parsedResult ? JSON.stringify(parsedResult, null, 2) : "אין נתונים"}
          </pre>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">סגור</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ParsedResultDialog;
