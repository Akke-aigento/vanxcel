import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCustomerAuth } from "@/integrations/sellqo/CustomerAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ArrowRight, Check, X } from "lucide-react";
import loginHero from "@/assets/login-hero.jpg";

const PasswordStrength = ({ password }: { password: string }) => {
  const checks = [
    { label: "8+ tekens", pass: password.length >= 8 },
    { label: "Hoofdletter", pass: /[A-Z]/.test(password) },
    { label: "Cijfer", pass: /\d/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="flex gap-3 mt-1.5">
      {checks.map((c) => (
        <span key={c.label} className={`flex items-center gap-1 text-xs ${c.pass ? "text-emerald-400" : "text-muted-foreground"}`}>
          {c.pass ? <Check size={12} /> : <X size={12} />} {c.label}
        </span>
      ))}
    </div>
  );
};

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, register } = useCustomerAuth();

  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const from = (location.state as { from?: string })?.from || "/account";

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error(t("auth.fillAll")); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success(t("auth.loginSuccess"));
    } catch (err: any) {
      toast.error(err.message || t("auth.loginError"));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !regEmail || !regPassword) {
      toast.error(t("auth.fillAll")); return;
    }
    if (regPassword !== regConfirm) {
      toast.error(t("auth.passwordMismatch")); return;
    }
    if (regPassword.length < 8) {
      toast.error(t("auth.passwordTooShort")); return;
    }
    setLoading(true);
    try {
      await register({ email: regEmail, password: regPassword, first_name: firstName, last_name: lastName });
      toast.success(t("auth.registerSuccess"));
    } catch (err: any) {
      toast.error(err.message || t("auth.registerError"));
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
          <h1 className="font-display text-6xl text-foreground leading-none mb-4">
            POWER YOUR<br />
            <span className="text-primary">JOURNEY.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            {t("auth.heroSubtitle", "Alles voor jouw off-grid avontuur. Van LiFePO4 batterijen tot complete systemen.")}
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
          {/* Logo / brand */}
          <Link to="/" className="block mb-10">
            <span className="font-display text-3xl text-foreground">VAN<span className="text-primary">XCEL</span></span>
          </Link>

          {/* Tab switcher */}
          <div className="flex mb-8 border-b border-border/30">
            <button
              onClick={() => setTab("login")}
              className={`pb-3 px-1 mr-6 text-sm font-medium transition-all duration-300 border-b-2 ${
                tab === "login"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("auth.login")}
            </button>
            <button
              onClick={() => setTab("register")}
              className={`pb-3 px-1 text-sm font-medium transition-all duration-300 border-b-2 ${
                tab === "register"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("auth.register")}
            </button>
          </div>

          {/* Login Form */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in-0 slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t("auth.email")}
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="je@email.com"
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t("auth.password")}
                </Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={inputClasses}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full h-12 text-sm font-semibold gap-2 group" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={16} /> : null}
                {t("auth.login")}
                {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
              </Button>
              <Link
                to="/reset-password"
                className="block text-center text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t("auth.forgotPassword")}
              </Link>
            </form>
          )}

          {/* Register Form */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-5 animate-in fade-in-0 slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    {t("auth.firstName")}
                  </Label>
                  <Input value={firstName} onChange={e => setFirstName(e.target.value)} className={inputClasses} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    {t("auth.lastName")}
                  </Label>
                  <Input value={lastName} onChange={e => setLastName(e.target.value)} className={inputClasses} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("auth.email")}</Label>
                <Input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="je@email.com"
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("auth.password")}</Label>
                <Input
                  type="password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder={t("auth.min8chars")}
                  className={inputClasses}
                />
                <PasswordStrength password={regPassword} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("auth.confirmPassword")}</Label>
                <Input
                  type="password"
                  value={regConfirm}
                  onChange={e => setRegConfirm(e.target.value)}
                  className={inputClasses}
                />
              </div>
              <Button type="submit" className="w-full h-12 text-sm font-semibold gap-2 group" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={16} /> : null}
                {t("auth.register")}
                {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
