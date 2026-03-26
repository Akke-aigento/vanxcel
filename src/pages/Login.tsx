import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCustomerAuth } from "@/integrations/sellqo/CustomerAuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, register } = useCustomerAuth();

  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);

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
      await register({ email: regEmail, password: regPassword, first_name: firstName, last_name: lastName, company_name: companyName || undefined, vat_number: vatNumber || undefined, newsletter_opt_in: newsletterOptIn });
      toast.success(t("auth.registerSuccess"));
    } catch (err: any) {
      toast.error(err.message || t("auth.registerError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center pt-28 pb-16 px-4">
        <div className="w-full max-w-md">
          <Tabs value={tab} onValueChange={setTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
              <TabsTrigger value="register">{t("auth.register")}</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">{t("auth.email")}</Label>
                  <Input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="je@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">{t("auth.password")}</Label>
                  <div className="relative">
                    <Input id="login-password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                  {t("auth.login")}
                </Button>
                <Link to="/reset-password" className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("auth.forgotPassword")}
                </Link>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-first">{t("auth.firstName")}</Label>
                    <Input id="reg-first" value={firstName} onChange={e => setFirstName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-last">{t("auth.lastName")}</Label>
                    <Input id="reg-last" value={lastName} onChange={e => setLastName(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">{t("auth.email")}</Label>
                  <Input id="reg-email" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="je@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">{t("auth.password")}</Label>
                  <Input id="reg-password" type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder={t("auth.min8chars")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-confirm">{t("auth.confirmPassword")}</Label>
                  <Input id="reg-confirm" type="password" value={regConfirm} onChange={e => setRegConfirm(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-company">{t("auth.companyName")}</Label>
                  <Input id="reg-company" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder={t("auth.companyPlaceholder")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-vat">{t("auth.vatNumber")}</Label>
                  <Input id="reg-vat" value={vatNumber} onChange={e => setVatNumber(e.target.value)} placeholder="BE0123456789" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="reg-newsletter" checked={newsletterOptIn} onChange={e => setNewsletterOptIn(e.target.checked)} className="rounded border-border" />
                  <Label htmlFor="reg-newsletter" className="text-sm font-normal cursor-pointer">{t("auth.newsletterOptIn")}</Label>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                  {t("auth.register")}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
