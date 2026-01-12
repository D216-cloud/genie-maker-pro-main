const TrustBar = () => {
  const logos = [
    { name: "Meta", style: "font-bold text-sm sm:text-base md:text-xl" },
    { name: "Forbes", style: "font-serif text-sm sm:text-base md:text-xl font-bold" },
    { name: "TechCrunch", style: "font-bold text-xs sm:text-sm md:text-lg" },
    { name: "Product Hunt", style: "font-medium text-xs sm:text-sm md:text-lg" },
    { name: "Entrepreneur", style: "font-bold text-xs sm:text-sm md:text-lg" },
  ];

  return (
    <section className="py-8 sm:py-10 md:py-12 border-y border-border/50 bg-muted/30">
      <div className="container mx-auto px-4">
        <p className="text-center text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 md:mb-8">
          Featured in
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-16">
          {logos.map((logo) => (
            <div 
              key={logo.name} 
              className={`${logo.style} text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer`}
            >
              {logo.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
