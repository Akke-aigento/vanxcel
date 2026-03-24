import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import RevealOnScroll from "./RevealOnScroll";

const reviews = [
  { name: "Henk van Dusschoten", text: "De powerstation is degelijk uitgevoerd. Met een goed overzichtelijke display.", product: "1000W Powerstation", stars: 5 },
  { name: "Jesse", text: "In tegenstelling tot andere goedkopere relais, werkt deze perfect!", product: "Automatic Relay 140A", stars: 5 },
  { name: "D. Wouters", text: "De 300Ah gaat zo lang mee! Perfect pakket voor mijn ombouw.", product: "TheSMALL Kit 300Ah", stars: 5 },
  { name: "Ine Peeters", text: "Duidelijke handleiding, alles stond snel en werkt meteen. Aanrader!", product: "TheBIG Kit", stars: 5 },
  { name: "Wouter M.", text: "Genoeg vermogen voor verlichting, laptop en koelkastje.", product: "TheSMALL Kit 200Ah", stars: 5 },
  { name: "Tom L.", text: "We kunnen er echt alles op draaien, zelfs een kleine boiler.", product: "300Ah LiFePO4 Battery", stars: 5 },
  { name: "Marc D.", text: "Verrassend stil, en genoeg power om onze setup te draaien.", product: "1000W Powerstation", stars: 4 },
  { name: "Sarah Verbeeck", text: "Deze bundel gaf ons de vrijheid waar we naar zochten.", product: "TheBIG Kit", stars: 5 },
  { name: "Hanna Mertens", text: "Staat al maanden in ons busje, nog nooit problemen gehad.", product: "200Ah LiFePO4 Battery", stars: 5 },
  { name: "Lotte V.", text: "Verrassend stil in gebruik, genoeg voor laptop, lampen en zelfs m'n drone!", product: "TheBIG Powerstation Kit", stars: 5 },
];

const ReviewCard = ({ review }: { review: typeof reviews[0] }) => (
  <div className="flex-shrink-0 w-80 bg-card border border-border rounded-lg p-5 mx-3">
    <div className="flex gap-0.5 mb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < review.stars ? "fill-accent text-accent" : "text-muted-foreground"}
        />
      ))}
    </div>
    <p className="text-sm text-foreground/80 mb-3 leading-relaxed">"{review.text}"</p>
    <div>
      <p className="text-xs font-semibold text-foreground">{review.name}</p>
      <p className="text-xs text-muted-foreground">{review.product}</p>
    </div>
  </div>
);

const ReviewsMarquee = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-secondary/50 py-16 overflow-hidden">
      <RevealOnScroll direction="up">
        <h2 className="font-display text-4xl md:text-5xl text-center text-foreground mb-4">
          {t("reviews.title")}
        </h2>
        <p className="text-center text-muted-foreground mb-10">
          {t("reviews.subtitle")}
        </p>
      </RevealOnScroll>
      <RevealOnScroll direction="fade" delay={200}>
        <div className="relative">
          <div className="flex marquee-track">
            {[...reviews, ...reviews].map((review, i) => (
              <ReviewCard key={i} review={review} />
            ))}
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
};

export default ReviewsMarquee;
