import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCustomerAuth } from "@/integrations/sellqo/CustomerAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Check, Building2, User, Bell } from "lucide-react";

const sectionTitle = "text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-4 flex items-center gap-2";
const inputClasses = "bg-secondary/50 border-border/50 h-11 focus-visible:ring-primary/50 focus-visible:border-primary/40";

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
    <form onSubmit={handleSave} className="space-y-8 max-w-xl">
      {/* Personal */}
      <div>
        <h3 className={sectionTitle}><User size={14} /> {t("account.personalInfo", "Persoonlijke gegevens")}</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">{t("auth.firstName")}</Label>
              <Input value={firstName} onChange={e => setFirstName(e.target.value)} className={inputClasses} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t("auth.lastName")}</Label>
              <Input value={lastName} onChange={e => setLastName(e.target.value)} className={inputClasses} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">{t("auth.email")}</Label>
            <Input value={customer?.email || ""} disabled className="opacity-50 h-11" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">{t("account.phone")}</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} className={inputClasses} />
          </div>
        </div>
      </div>

      <div className="border-t border-border/30" />

      {/* Company */}
      <div>
        <h3 className={sectionTitle}><Building2 size={14} /> {t("account.companyInfo", "Bedrijfsgegevens")}</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">{t("auth.companyName")}</Label>
            <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder={t("auth.companyPlaceholder")} className={inputClasses} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs">{t("auth.vatNumber")}</Label>
              {customer?.vat_verified && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Check size={10} /> {t("account.vatVerified")}
                </span>
              )}
            </div>
            <Input value={vatNumber} onChange={e => setVatNumber(e.target.value)} placeholder="BE0123456789" className={inputClasses} />
          </div>
        </div>
      </div>

      <div className="border-t border-border/30" />

      {/* Preferences */}
      <div>
        <h3 className={sectionTitle}><Bell size={14} /> {t("account.preferences", "Voorkeuren")}</h3>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="newsletter-toggle"
            checked={newsletterOptIn}
            onChange={e => setNewsletterOptIn(e.target.checked)}
            className="rounded border-border h-4 w-4 accent-primary"
          />
          <Label htmlFor="newsletter-toggle" className="text-sm font-normal cursor-pointer">
            {t("auth.newsletterOptIn")}
          </Label>
        </div>
      </div>

      <Button type="submit" disabled={saving} className="gap-2">
        {saving && <Loader2 className="animate-spin" size={16} />}
        {t("account.save")}
      </Button>
    </form>
  );
};

export default ProfileTab;
