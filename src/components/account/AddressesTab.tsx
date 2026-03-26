import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCustomerApi } from "@/integrations/sellqo/useCustomerApi";
import { type Address } from "@/integrations/sellqo/CustomerAuthContext";
import { useAddressAutocomplete } from "@/hooks/use-address-autocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CountrySelect, getCountryFlag } from "@/components/ui/CountrySelect";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, MapPin, Search } from "lucide-react";

const inputClasses = "bg-secondary/50 border-border/50 h-11 focus-visible:ring-primary/50 focus-visible:border-primary/40";

const AddressesTab = () => {
  const { t } = useTranslation();
  const api = useCustomerApi();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ street: "", house_number: "", postal_code: "", city: "", country: "BE" });
  const [searchQuery, setSearchQuery] = useState("");
  const { suggestions, loading: searching, search, clear } = useAddressAutocomplete();

  const fetchAddresses = async () => {
    try {
      const data = await api.getAddresses();
      setAddresses(Array.isArray(data) ? data : []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchAddresses(); }, []); // eslint-disable-line

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    search(val);
  };

  const selectSuggestion = (s: any) => {
    setForm({
      street: s.street,
      house_number: s.house_number,
      postal_code: s.postal_code,
      city: s.city,
      country: s.country || "BE",
    });
    setSearchQuery("");
    clear();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.updateAddress(editId, form);
      } else {
        await api.addAddress(form as any);
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
    <div className="space-y-4 max-w-xl">
      {addresses.map(addr => (
        <div key={addr.id} className="bg-secondary/30 border border-border/30 rounded-xl p-5 flex justify-between items-start group hover:border-primary/20 transition-colors">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-lg">
              {getCountryFlag(addr.country) || <MapPin size={16} className="text-primary" />}
            </div>
            <div className="text-sm">
              <p className="font-medium text-foreground">{addr.street} {addr.house_number}</p>
              <p className="text-muted-foreground">{addr.postal_code} {addr.city}, {addr.country}</p>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={() => startEdit(addr)} className="h-8 text-xs">{t("account.edit")}</Button>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(addr.id)} className="h-8 text-destructive hover:text-destructive"><Trash2 size={14} /></Button>
          </div>
        </div>
      ))}

      {showForm ? (
        <div className="bg-secondary/30 border border-border/30 rounded-xl p-5 space-y-4">
          {/* Autocomplete search */}
          <div className="space-y-2 relative">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Search size={12} /> {t("account.searchAddress", "Zoek adres")}
            </Label>
            <Input
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder={t("account.searchAddressPlaceholder", "Typ je adres...")}
              className={inputClasses}
            />
            {suggestions.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                {suggestions.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => selectSuggestion(s)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-primary/10 transition-colors border-b border-border/20 last:border-0"
                  >
                    <span className="flex items-center gap-2">
                      <MapPin size={14} className="text-primary shrink-0" />
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {searching && <Loader2 className="absolute right-3 top-9 animate-spin text-muted-foreground" size={14} />}
          </div>

          <div className="border-t border-border/20 pt-3" />

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">{t("account.street")}</Label>
                <Input value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} className={inputClasses} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("account.houseNumber")}</Label>
                <Input value={form.house_number} onChange={e => setForm({ ...form, house_number: e.target.value })} className={inputClasses} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{t("account.postalCode")}</Label>
                <Input value={form.postal_code} onChange={e => setForm({ ...form, postal_code: e.target.value })} className={inputClasses} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("account.city")}</Label>
                <Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className={inputClasses} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("account.country")}</Label>
              <CountrySelect value={form.country} onChange={v => setForm({ ...form, country: v })} className={inputClasses} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" size="sm">{editId ? t("account.save") : t("account.addAddress")}</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditId(null); }}>{t("configurator.back")}</Button>
            </div>
          </form>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setShowForm(true)} className="gap-2 border-dashed border-border/50 hover:border-primary/40">
          <Plus size={16} /> {t("account.addAddress")}
        </Button>
      )}
    </div>
  );
};

export default AddressesTab;
