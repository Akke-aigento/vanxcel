import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCustomerApi } from "@/integrations/sellqo/useCustomerApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowRight, Mail, KeyRound, CheckCircle } from "lucide-react";
import loginHero from "@/assets/login-hero.jpg";

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

  const inputClasses = "bg-secondary/50 border-border/50 h-12 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50 focus-visible:border-primary/40 transition-all duration-200";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left — Hero Image (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <img
          src={loginHero}
          alt="Campervan at sunset"
          className="absolute inset-0 w-full h-full object-cover"
          width={1280}
          height={1920}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-background/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />

        <div className="relative z-10 flex flex-col justify-end p-16 pb-24">
          <KeyRound className="w-16 h-16 text-primary mb-6" strokeWidth={1.5} />
          <h1 className="font-display text-5xl text-foreground leading-none mb-4">
            {t("auth.resetPassword")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            {t("auth.resetInstructions")}
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 relative">
        {/* Mobile background */}
        <div className="absolute inset-0 lg:hidden">
          <img src={loginHero} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-background/85" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <Link to="/" className="block mb-10">
            <span className="font-display text-3xl text-foreground">VAN<span className="text-primary">XCEL</span></span>
          </Link>

          {done ? (
            <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <p className="text-center text-muted-foreground">
                {hasToken ? t("auth.passwordResetSuccess") : t("auth.resetEmailSent")}
              </p>
              <Link to="/login" className="block">
                <Button variant="outline" className="w-full h-12">{t("auth.backToLogin")}</Button>
              </Link>
            </div>
          ) : hasToken ? (
            <form onSubmit={handleReset} className="space-y-5 animate-in fade-in-0 slide-in-from-right-4 duration-300">
              <h2 className="font-display text-2xl text-foreground mb-2">{t("auth.resetPassword")}</h2>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("auth.newPassword")}</Label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={t("auth.min8chars")} className={inputClasses} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("auth.confirmPassword")}</Label>
                <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClasses} />
              </div>
              <Button type="submit" className="w-full h-12 text-sm font-semibold gap-2 group" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={16} /> : null}
                {t("auth.resetPassword")}
                {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRequest} className="space-y-5 animate-in fade-in-0 slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-display text-2xl text-foreground">{t("auth.resetPassword")}</h2>
              </div>
              <p className="text-sm text-muted-foreground">{t("auth.resetInstructions")}</p>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("auth.email")}</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="je@email.com" className={inputClasses} />
              </div>
              <Button type="submit" className="w-full h-12 text-sm font-semibold gap-2 group" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={16} /> : null}
                {t("auth.sendResetLink")}
                {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
              </Button>
              <Link to="/login" className="block text-center text-sm text-muted-foreground hover:text-primary transition-colors">
                {t("auth.backToLogin")}
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
