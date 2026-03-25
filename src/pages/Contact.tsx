import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { sellqoFetch } from "@/integrations/sellqo/client";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Send, MessageCircle, Clock, ChevronRight, Package } from "lucide-react";

const Contact = () => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      toast({ title: t("contact.fillAll"), variant: "destructive" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast({ title: t("contact.invalidEmail"), variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const body: Record<string, string> = {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      };
      if (orderNumber.trim()) {
        body.orderNumber = orderNumber.trim();
      }

      await sellqoFetch("/contact", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setSuccess(true);
      setName("");
      setEmail("");
      setSubject("");
      setOrderNumber("");
      setMessage("");
    } catch {
      toast({
        title: t("contact.error"),
        description: t("contact.errorDesc"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-20">
        <div className="grid lg:grid-cols-5 gap-10 max-w-5xl mx-auto">
          {/* Left column — info */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-display text-foreground mb-3">
                {t("contact.title")}
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed">
                {t("contact.subtitle")}
              </p>
            </div>

            {/* Direct contact cards */}
            <div className="space-y-4">
              <a
                href="https://wa.me/32471234567"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                  <MessageCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{t("contact.whatsapp")}</p>
                  <p className="text-xs text-muted-foreground">{t("contact.whatsappDesc")}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>

              <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">info@vanxcel.com</p>
                  <p className="text-xs text-muted-foreground">{t("contact.emailDesc")}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{t("contact.responseTime")}</p>
                  <p className="text-xs text-muted-foreground">{t("contact.responseTimeDesc")}</p>
                </div>
              </div>
            </div>

            {/* Decorative glow */}
            <div className="hidden lg:block relative mt-auto">
              <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
            </div>
          </div>

          {/* Right column — form */}
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-border bg-card p-6 md:p-8">
              {success ? (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Send className="h-7 w-7 text-primary" />
                  </div>
                  <p className="text-foreground font-medium text-lg mb-1">{t("contact.success")}</p>
                  <Button variant="outline" className="mt-6" onClick={() => setSuccess(false)}>
                    {t("contact.newMessage")}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("contact.name")}</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("contact.namePlaceholder")} required maxLength={100} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("contact.email")}</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("contact.emailPlaceholder")} required maxLength={255} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">{t("contact.subject")}</Label>
                    <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t("contact.subjectPlaceholder")} required maxLength={200} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orderNumber" className="flex items-center gap-2">
                      <Package className="h-3.5 w-3.5 text-muted-foreground" />
                      {t("contact.orderNumber")}
                      <span className="text-xs text-muted-foreground font-normal">({t("contact.optional")})</span>
                    </Label>
                    <Input id="orderNumber" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder={t("contact.orderNumberPlaceholder")} maxLength={50} />
                    <p className="text-xs text-muted-foreground">{t("contact.orderNumberHint")}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{t("contact.message")}</Label>
                    <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t("contact.messagePlaceholder")} required maxLength={2000} className="min-h-[140px]" />
                  </div>

                  <Button type="submit" className="w-full h-11" disabled={loading}>
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? t("contact.sending") : t("contact.send")}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
