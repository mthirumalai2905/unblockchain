import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Share2, Trash2, Eye, Pencil } from "lucide-react";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string | null;
  sessionName: string;
}

interface ShareEntry {
  id: string;
  shared_with_email: string;
  permission: "read" | "write";
  created_at: string;
}

const ShareDialog = ({ isOpen, onClose, sessionId, sessionName }: ShareDialogProps) => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<"read" | "write">("read");
  const [shares, setShares] = useState<ShareEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const loadShares = useCallback(async () => {
    if (!sessionId) return;
    const { data } = await supabase
      .from("session_shares")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false });
    setShares((data || []) as ShareEntry[]);
  }, [sessionId]);

  useEffect(() => {
    if (isOpen) loadShares();
  }, [isOpen, loadShares]);

  const handleShare = async () => {
    if (!sessionId || !user || !email.trim()) return;
    if (email.trim() === user.email) {
      toast.error("You can't share with yourself");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("session_shares").insert({
      session_id: sessionId,
      shared_by: user.id,
      shared_with_email: email.trim(),
      permission,
    });
    if (error) {
      if (error.code === "23505") toast.error("Already shared with this email");
      else toast.error("Failed to share: " + error.message);
    } else {
      toast.success(`Shared with ${email.trim()} (${permission})`);
      setEmail("");
      loadShares();
    }
    setLoading(false);
  };

  const handleRemove = async (id: string) => {
    const { error } = await supabase.from("session_shares").delete().eq("id", id);
    if (!error) {
      setShares((prev) => prev.filter((s) => s.id !== id));
      toast.success("Share removed");
    }
  };

  const handleUpdatePermission = async (id: string, newPerm: "read" | "write") => {
    const { error } = await supabase.from("session_shares").update({ permission: newPerm }).eq("id", id);
    if (!error) {
      setShares((prev) => prev.map((s) => s.id === id ? { ...s, permission: newPerm } : s));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Share2 className="w-4 h-4" />
            Share "{sessionName}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add new share */}
          <div className="flex gap-2">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address..."
              className="flex-1 text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleShare()}
            />
            <Select value={permission} onValueChange={(v) => setPermission(v as "read" | "write")}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="read">
                  <span className="flex items-center gap-1.5"><Eye className="w-3 h-3" /> Read</span>
                </SelectItem>
                <SelectItem value="write">
                  <span className="flex items-center gap-1.5"><Pencil className="w-3 h-3" /> Write</span>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleShare} disabled={loading || !email.trim()} size="sm">
              Share
            </Button>
          </div>

          {/* Existing shares */}
          {shares.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Shared with</p>
              {shares.map((share) => (
                <div key={share.id} className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-card">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{share.shared_with_email}</p>
                  </div>
                  <Select
                    value={share.permission}
                    onValueChange={(v) => handleUpdatePermission(share.id, v as "read" | "write")}
                  >
                    <SelectTrigger className="w-[90px] h-7 text-[11px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="write">Write</SelectItem>
                    </SelectContent>
                  </Select>
                  <button
                    onClick={() => handleRemove(share.id)}
                    className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Not shared with anyone yet</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
