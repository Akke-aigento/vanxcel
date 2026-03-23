import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { sellqoFetch } from "@/integrations/sellqo/client";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Send } from "lucide-react";

const Contact = () => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
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
      await sellqoFetch("/contact", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });
      setSuccess(true);
      setName("");
      setEmail("");
      setSubject("");
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
      <main className="container mx-auto px-4 pt-28 pb-20 max-w-xl">
        <Card className="border-border bg-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-display">{t("contact.title")}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{t("contact.subtitle")}</p>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-6 text-center">
                <p className="text-foreground font-medium">{t("contact.success")}</p>
                <Button variant="outline" className="mt-4" onClick={() => setSuccess(false)}>
                  {t("contact.newMessage")}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("contact.name")}</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("contact.namePlaceholder")} required maxLength={100} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("contact.email")}</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("contact.emailPlaceholder")} required maxLength={255} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">{t("contact.subject")}</Label>
                  <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t("contact.subjectPlaceholder")} required maxLength={200} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">{t("contact.message")}</Label>
                  <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t("contact.messagePlaceholder")} required maxLength={2000} className="min-h-[120px]" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? t("contact.sending") : t("contact.send")}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
