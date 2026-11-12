import { Leaf, FlaskConical, Sprout, ShieldCheck, HeartHandshake, PackageCheck } from "lucide-react";
import { FeatureCard } from "./FeatureCard";

const features = [
  {
    icon: Leaf,
    title: "100% Natural Ingredients",
    description: "Nature-inspired ingredients carefully selected for your everyday wellness.",
  },
  {
    icon: FlaskConical,
    title: "Quality You Can Trust",
    description: "A strong focus on quality, purity, and consistency in every product.",
  },
  {
    icon: Sprout,
    title: "Rooted in Ayurveda",
    description: "Inspired by traditional Ayurvedic wisdom passed down through generations.",
  },
  {
    icon: ShieldCheck,
    title: "Safety & Care",
    description: "Thoughtful product standards with care at every step.",
  },
  {
    icon: HeartHandshake,
    title: "Customer First",
    description: "Your satisfaction and wellness remain at the heart of what we do.",
  },
  {
    icon: PackageCheck,
    title: "Careful Packaging",
    description: "Products packed with attention and care, ready to reach your doorstep.",
  },
];

export const WhyChooseUs = () => {
  return (
    <section
      aria-labelledby="why-choose-title"
      className="relative overflow-hidden bg-gradient-nature py-16 md:py-24"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 leaf-pattern opacity-40" />

      <div className="container relative mx-auto px-4">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Why Choose Us
          </span>
          <h2
            id="why-choose-title"
            className="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl lg:text-5xl"
          >
            Why Choose <span className="text-primary">Dinkar Ayurveda?</span>
          </h2>
          <p className="mb-3 text-base font-medium tracking-wide text-accent-foreground/80 md:text-lg">
            Ancient Wisdom. Natural Goodness. Modern Quality.
          </p>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            We combine the goodness of nature with the wisdom of Ayurveda to bring you
            thoughtful wellness solutions for everyday life.
          </p>
        </div>

        {/* Features Grid */}
        <ul className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3 lg:gap-8">
          {features.map((feature, index) => (
            <li key={feature.title} className="h-full">
              <FeatureCard {...feature} index={index} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
