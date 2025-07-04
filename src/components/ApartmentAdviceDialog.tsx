
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  advice: string | null;
  error: string | null;
  onRetry: () => void;
  joke?: string | null;
  jokeLoading?: boolean;
  jokeError?: string | null;
}

const ApartmentAdviceDialog: React.FC<Props> = ({
  open, onOpenChange, loading, advice, error, onRetry,
  joke, jokeLoading, jokeError,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Brain className="text-purple-600" />
            המלצת GPT לדירה הזו
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          התייעצות עם בינה מלאכותית לגבי מידת הכדאיות של הדירה 😸
        </DialogDescription>
        <div className="py-4 min-h-16 text-center">
          {loading ? (
            <div className="text-purple-700 flex flex-col items-center gap-3">
              <span className="animate-spin inline-block text-3xl">🤔</span>
              מחשב המלצה...
            </div>
          ) : error ? (
            <div className="text-red-600">
              {error}
              <Button size="sm" className="mt-2" onClick={onRetry}>נסה שוב</Button>
            </div>
          ) : advice ? (
            <div className="text-purple-800 text-base font-medium bg-purple-50 rounded p-2">
              {advice}
            </div>
          ) : null}
        </div>
        <div className="py-1 min-h-12 text-center">
          {/* בדיחה על הדירה */}
          <div className="mt-2">
            <b>בדיחה על הדירה:</b>
          </div>
          {jokeLoading ? (
            <div className="text-sky-700 flex flex-col items-center gap-2">
              <span className="animate-spin inline-block text-xl">😺</span>
              מחשב בדיחה...
            </div>
          ) : jokeError ? (
            <div className="text-red-500">{jokeError}</div>
          ) : joke ? (
            <div className="text-sky-900 text-base bg-sky-50 rounded p-2">
              {joke}
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>סגור</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApartmentAdviceDialog;

