import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCustomerApi } from "@/integrations/sellqo/useCustomerApi";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const ResetPassword = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");
  const resetEmail = searchParams.get("email");
  const hasToken = !!resetToken && !!resetEmail;

  const { requestPasswordReset, resetPassword } = useCustomerApi();

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error(t("auth.fillAll")); return; }
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setDone(true);
      toast.success(t("auth.resetEmailSent"));
    } catch (err: any) {
      toast.error(err.message || t("auth.resetError"));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error(t("auth.passwordMismatch")); return; }
    if (newPassword.length < 8) { toast.error(t("auth.passwordTooShort")); return; }
    setLoading(true);
    try {
      await resetPassword(resetEmail!, resetToken!, newPassword);
      setDone(true);
      toast.success(t("auth.passwordResetSuccess"));
    } catch (err: any) {
      toast.error(err.message || t("auth.resetError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center pt-28 pb-16 px-4">
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-2xl font-bold text-center">{t("auth.resetPassword")}</h1>

          {done ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                {hasToken ? t("auth.passwordResetSuccess") : t("auth.resetEmailSent")}
              </p>
              <Link to="/login">
                <Button variant="outline">{t("auth.backToLogin")}</Button>
              </Link>
            </div>
          ) : hasToken ? (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label>{t("auth.newPassword")}</Label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={t("auth.min8chars")} />
              </div>
              <div className="space-y-2">
                <Label>{t("auth.confirmPassword")}</Label>
                <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                {t("auth.resetPassword")}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRequest} className="space-y-4">
              <p className="text-sm text-muted-foreground">{t("auth.resetInstructions")}</p>
              <div className="space-y-2">
                <Label>{t("auth.email")}</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="je@email.com" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                {t("auth.sendResetLink")}
              </Button>
              <Link to="/login" className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("auth.backToLogin")}
              </Link>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;
