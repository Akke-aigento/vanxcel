import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useDocumentTitle } from "@/hooks/use-document-title";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RevealOnScroll from "@/components/RevealOnScroll";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const { t } = useTranslation();
  useDocumentTitle(t("faq.title"), {
    description:
      "Antwoorden op veelgestelde vragen over VanXcel campervan-systemen: producten, batterijen, verzending, garantie en support.",
    path: "/faq",
  });

  const categories = [
    {
      title: t("faq.catProducts"),
      items: [
        { q: t("faq.q1"), a: t("faq.a1") },
        { q: t("faq.q2"), a: t("faq.a2") },
        { q: t("faq.q3"), a: t("faq.a3") },
      ],
    },
    {
      title: t("faq.catBatteries"),
      items: [
        { q: t("faq.q4"), a: t("faq.a4") },
        { q: t("faq.q5"), a: t("faq.a5") },
        { q: t("faq.q6"), a: t("faq.a6") },
      ],
    },
    {
      title: t("faq.catShipping"),
      items: [
        { q: t("faq.q7"), a: t("faq.a7") },
        { q: t("faq.q8"), a: t("faq.a8") },
        { q: t("faq.q9"), a: t("faq.a9") },
      ],
    },
    {
      title: t("faq.catOther"),
      items: [
        { q: t("faq.q10"), a: t("faq.a10") },
        { q: t("faq.q11"), a: t("faq.a11") },
        { q: t("faq.q12"), a: t("faq.a12") },
      ],
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: categories.flatMap((cat) =>
      cat.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      }))
    ),
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(faqJsonLd);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <RevealOnScroll direction="up">
            <div className="text-center mb-16">
              <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
                {t("faq.title")}
              </h1>
              <p className="text-muted-foreground text-lg">
                {t("faq.subtitle")}
              </p>
            </div>
          </RevealOnScroll>

          <div className="space-y-12">
            {categories.map((cat, ci) => (
              <RevealOnScroll key={ci} direction="up" delay={ci * 100}>
                <div>
                  <h2 className="font-display text-2xl text-foreground mb-4 flex items-center gap-2">
                    <span className="w-8 h-0.5 bg-primary inline-block" />
                    {cat.title}
                  </h2>
                  <Accordion type="single" collapsible className="border border-border rounded-lg overflow-hidden">
                    {cat.items.map((item, i) => (
                      <AccordionItem key={i} value={`${ci}-${i}`} className="border-border">
                        <AccordionTrigger className="px-5 text-left text-foreground hover:no-underline hover:text-primary transition-colors">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="px-5 text-muted-foreground leading-relaxed">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default FAQ;
