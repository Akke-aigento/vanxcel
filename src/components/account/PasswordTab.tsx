import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCustomerApi } from "@/integrations/sellqo/useCustomerApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const inputClasses = "bg-secondary/50 border-border/50 h-11 focus-visible:ring-primary/50 focus-visible:border-primary/40";

const PasswordTab = () => {
  const { t } = useTranslation();
  const api = useCustomerApi();
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirm) { toast.error(t("auth.passwordMismatch")); return; }
    if (newPw.length < 8) { toast.error(t("auth.passwordTooShort")); return; }
    setSaving(true);
    try {
      await api.changePassword(current, newPw);
      toast.success(t("account.passwordChanged"));
      setCurrent(""); setNewPw(""); setConfirm("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
      <div className="space-y-2">
        <Label className="text-xs">{t("account.currentPassword")}</Label>
        <Input type="password" value={current} onChange={e => setCurrent(e.target.value)} className={inputClasses} />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">{t("auth.newPassword")}</Label>
        <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder={t("auth.min8chars")} className={inputClasses} />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">{t("auth.confirmPassword")}</Label>
        <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className={inputClasses} />
      </div>
      <Button type="submit" disabled={saving} className="gap-2">
        {saving && <Loader2 className="animate-spin" size={16} />}
        {t("account.changePassword")}
      </Button>
    </form>
  );
};

export default PasswordTab;
