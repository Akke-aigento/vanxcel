import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCustomerAuth, type Address } from "@/integrations/sellqo/CustomerAuthContext";
import { useCustomerApi } from "@/integrations/sellqo/useCustomerApi";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, LogOut, User, MapPin, ShoppingBag, Lock } from "lucide-react";

/* ── Profile Tab ── */
const ProfileTab = () => {
  const { t } = useTranslation();
  const { customer, updateProfile } = useCustomerAuth();
  const [firstName, setFirstName] = useState(customer?.first_name || "");
  const [lastName, setLastName] = useState(customer?.last_name || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [companyName, setCompanyName] = useState(customer?.company_name || "");
  const [vatNumber, setVatNumber] = useState(customer?.vat_number || "");
  const [newsletterOptIn, setNewsletterOptIn] = useState(customer?.newsletter_opted_in || false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ first_name: firstName, last_name: lastName, phone, company_name: companyName, vat_number: vatNumber, newsletter_opt_in: newsletterOptIn });
      toast.success(t("account.profileSaved"));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-4 max-w-lg">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("auth.firstName")}</Label>
          <Input value={firstName} onChange={e => setFirstName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>{t("auth.lastName")}</Label>
          <Input value={lastName} onChange={e => setLastName(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>{t("auth.email")}</Label>
        <Input value={customer?.email || ""} disabled className="opacity-60" />
      </div>
      <div className="space-y-2">
        <Label>{t("account.phone")}</Label>
        <Input value={phone} onChange={e => setPhone(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>{t("auth.companyName")}</Label>
        <Input value={companyName} onChange={e => setCompanyName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label>{t("auth.vatNumber")}</Label>
          {customer?.vat_verified && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">✓ {t("account.vatVerified")}</span>
          )}
        </div>
        <Input value={vatNumber} onChange={e => setVatNumber(e.target.value)} placeholder="BE0123456789" />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="newsletter-toggle" checked={newsletterOptIn} onChange={e => setNewsletterOptIn(e.target.checked)} className="rounded border-border" />
        <Label htmlFor="newsletter-toggle" className="text-sm font-normal cursor-pointer">{t("auth.newsletterOptIn")}</Label>
      </div>
      <Button type="submit" disabled={saving}>
        {saving && <Loader2 className="animate-spin mr-2" size={16} />}
        {t("account.save")}
      </Button>
    </form>
  );
};

/* ── Addresses Tab ── */
const AddressesTab = () => {
  const { t } = useTranslation();
  const api = useCustomerApi();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ street: "", house_number: "", postal_code: "", city: "", country: "BE" });

  const fetchAddresses = async () => {
    try {
      const data = await api.getAddresses();
      setAddresses(Array.isArray(data) ? data : []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchAddresses(); }, []); // eslint-disable-line

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        const result = await api.updateAddress(editId, form);
        setAddresses(Array.isArray(result) ? result : addresses);
      } else {
        const result = await api.addAddress(form as any);
        setAddresses(Array.isArray(result) ? result : addresses);
      }
      toast.success(t("account.addressSaved"));
      setShowForm(false);
      setEditId(null);
      setForm({ street: "", house_number: "", postal_code: "", city: "", country: "BE" });
      fetchAddresses();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteAddress(id);
      toast.success(t("account.addressDeleted"));
      fetchAddresses();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const startEdit = (addr: Address) => {
    setEditId(addr.id);
    setForm({ street: addr.street, house_number: addr.house_number || "", postal_code: addr.postal_code, city: addr.city, country: addr.country });
    setShowForm(true);
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4 max-w-lg">
      {addresses.map(addr => (
        <div key={addr.id} className="border border-border rounded-lg p-4 flex justify-between items-start">
          <div className="text-sm">
            <p className="font-medium">{addr.street} {addr.house_number}</p>
            <p className="text-muted-foreground">{addr.postal_code} {addr.city}, {addr.country}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => startEdit(addr)}>{t("account.edit")}</Button>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(addr.id)}><Trash2 size={14} /></Button>
          </div>
        </div>
      ))}

      {showForm ? (
        <form onSubmit={handleSubmit} className="border border-border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <Label>{t("account.street")}</Label>
              <Input value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>{t("account.houseNumber")}</Label>
              <Input value={form.house_number} onChange={e => setForm({ ...form, house_number: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>{t("account.postalCode")}</Label>
              <Input value={form.postal_code} onChange={e => setForm({ ...form, postal_code: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>{t("account.city")}</Label>
              <Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>{t("account.country")}</Label>
            <Input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <Button type="submit">{editId ? t("account.save") : t("account.addAddress")}</Button>
            <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setEditId(null); }}>{t("configurator.back")}</Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" onClick={() => setShowForm(true)} className="gap-2">
          <Plus size={16} /> {t("account.addAddress")}
        </Button>
      )}
    </div>
  );
};

/* ── Orders Tab ── */
const OrdersTab = () => {
  const { t } = useTranslation();
  const api = useCustomerApi();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOrders()
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin text-muted-foreground" /></div>;
  if (orders.length === 0) return <p className="text-muted-foreground py-4">{t("account.noOrders")}</p>;

  return (
    <div className="space-y-3 max-w-2xl">
      {orders.map((order: any) => (
        <div key={order.id} className="border border-border rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-sm">#{order.order_number}</p>
              <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">€{Number(order.total || 0).toFixed(2)}</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/50 text-accent-foreground">{order.status}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ── Password Tab ── */
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
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <Label>{t("account.currentPassword")}</Label>
        <Input type="password" value={current} onChange={e => setCurrent(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>{t("auth.newPassword")}</Label>
        <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder={t("auth.min8chars")} />
      </div>
      <div className="space-y-2">
        <Label>{t("auth.confirmPassword")}</Label>
        <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} />
      </div>
      <Button type="submit" disabled={saving}>
        {saving && <Loader2 className="animate-spin mr-2" size={16} />}
        {t("account.changePassword")}
      </Button>
    </form>
  );
};

/* ── Main Account Page ── */
const Account = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, loading, customer, logout } = useCustomerAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate("/login", { state: { from: "/account" }, replace: true });
  }, [loading, isAuthenticated, navigate]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="animate-spin text-muted-foreground" size={32} />
    </div>
  );

  if (!isAuthenticated) return null;

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto pt-28 pb-16 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">{t("account.title")}</h1>
          <p className="text-muted-foreground">{t("account.welcome", { name: customer?.first_name })}</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="flex flex-wrap gap-1">
            <TabsTrigger value="profile" className="gap-2"><User size={14} /> {t("account.profile")}</TabsTrigger>
            <TabsTrigger value="addresses" className="gap-2"><MapPin size={14} /> {t("account.addresses")}</TabsTrigger>
            <TabsTrigger value="orders" className="gap-2"><ShoppingBag size={14} /> {t("account.orders")}</TabsTrigger>
            <TabsTrigger value="password" className="gap-2"><Lock size={14} /> {t("account.password")}</TabsTrigger>
          </TabsList>

          <TabsContent value="profile"><ProfileTab /></TabsContent>
          <TabsContent value="addresses"><AddressesTab /></TabsContent>
          <TabsContent value="orders"><OrdersTab /></TabsContent>
          <TabsContent value="password"><PasswordTab /></TabsContent>
        </Tabs>

        <div className="mt-12 pt-6 border-t border-border">
          <Button variant="outline" onClick={handleLogout} className="gap-2 text-destructive hover:text-destructive">
            <LogOut size={16} /> {t("account.logout")}
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;
