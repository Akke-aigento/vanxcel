// Gidspagina uit de contentmotor van Akke Insights (/gids/<slug>). De inhoud komt bij de build
// uit Insights (__SEO_CONTENT__); de statische head en FAQ-gegevens schrijft seo-pages-plugin.ts.
import { Link, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useDocumentTitle } from "@/hooks/use-document-title";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { guideFor } from "@/seo/insights";
import NotFound from "./NotFound";

const Gids = () => {
  const { slug } = useParams();
  const g = guideFor(slug);
  useDocumentTitle(g?.h1, {
    description: g?.description,
    path: `/gids/${slug ?? ""}`,
    jsonLd: g?.faq.length
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: g.faq.map((f) => ({
            "@type": "Question",
            name: f.vraag,
            acceptedAnswer: { "@type": "Answer", text: f.antwoord },
          })),
        }
      : undefined,
  });

  if (!g) return <NotFound />;
  const href = g.cta_href || "/contact";
  const internal = href.startsWith("/");

  return (
    <div className="min-h-screen bg-background" lang={g.lang}>
      <Navbar />
      <main className="pt-32 pb-20 md:pt-40">
        <article className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-6">{g.h1}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-12">{g.intro}</p>
          {g.sections.map((s) => (
            <section key={s.kop} className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{s.kop}</h2>
              <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-line">{s.tekst}</p>
            </section>
          ))}
          {g.faq.length > 0 && (
            <section className="mt-14 mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {g.lang === "en" ? "Frequently asked questions" : "Veelgestelde vragen"}
              </h2>
              <Accordion type="single" collapsible>
                {g.faq.map((f, i) => (
                  <AccordionItem key={f.vraag} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left text-base md:text-lg font-bold">{f.vraag}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base leading-relaxed">{f.antwoord}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          )}
          {g.cta_label && (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 md:p-8">
              <Button asChild size="lg" className="font-bold">
                {internal ? (
                  <Link to={href}>
                    {g.cta_label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                ) : (
                  <a href={href}>
                    {g.cta_label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                )}
              </Button>
            </div>
          )}
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default Gids;
