import { useState } from "react";
import { ArrowRight } from "lucide-react";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  return (
    <section className="bg-secondary/50 py-20">
      <div className="container mx-auto px-4 max-w-xl text-center">
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
          KRIJG 10% KORTING
        </h2>
        <p className="text-muted-foreground mb-8">
          Schrijf je in voor onze nieuwsbrief en ontvang 10% korting op je eerste bestelling.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            window.open(`https://www.vanxcel.be/account/register?email=${encodeURIComponent(email)}`, '_blank');
          }}
          className="flex gap-2"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Je e-mailadres"
            required
            className="flex-1 px-4 py-3 bg-card border border-border rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-accent text-accent-foreground rounded font-semibold text-sm hover:brightness-110 transition-all flex items-center gap-2"
          >
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
