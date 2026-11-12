import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

export const FeatureCard = ({ icon: Icon, title, description, index }: FeatureCardProps) => {
  return (
    <article
      className="group relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-all duration-300 ease-out animate-fade-in-up hover:-translate-y-1 hover:border-primary/30 hover:bg-secondary/40 hover:shadow-card md:p-8"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground md:h-14 md:w-14">
        <Icon className="h-6 w-6 md:h-7 md:w-7" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h3 className="mb-2 font-serif text-lg font-semibold leading-snug text-foreground md:text-xl">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
        {description}
      </p>
    </article>
  );
};
