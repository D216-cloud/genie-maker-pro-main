const integrations = [
  { name: "Google", emoji: "🔍", position: "top-0 left-1/2 -translate-x-1/2" },
  { name: "Zapier", emoji: "⚡", position: "top-1/4 right-0" },
  { name: "Stripe", emoji: "💳", position: "bottom-1/4 right-0" },
  { name: "Mailchimp", emoji: "📧", position: "bottom-0 left-1/2 -translate-x-1/2" },
  { name: "Notion", emoji: "📝", position: "bottom-1/4 left-0" },
  { name: "Slack", emoji: "💬", position: "top-1/4 left-0" },
];

const IntegrationsSection = () => {
  return (
    <section id="integrations" className="py-12 sm:py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            Effortlessly integrate with
          </h2>
          <p className="text-base sm:text-lg md:text-xl">
            <span className="font-serif italic text-primary">Third-Party Apps</span>
          </p>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground px-2">
            Connect ReelyChat with your favorite tools
          </p>
        </div>

        <div className="relative max-w-xs sm:max-w-sm md:max-w-lg mx-auto aspect-square">
          {/* Center logo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-primary rounded-xl sm:rounded-2xl flex items-center justify-center shadow-glow-lg z-10">
            <span className="text-2xl sm:text-3xl md:text-4xl text-primary-foreground">⚡</span>
          </div>

          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
            {integrations.map((_, i) => {
              const angle = (i * 60 - 90) * (Math.PI / 180);
              const x = 200 + 140 * Math.cos(angle);
              const y = 200 + 140 * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1="200"
                  y1="200"
                  x2={x}
                  y2={y}
                  stroke="hsl(var(--border))"
                  strokeWidth="2"
                  strokeDasharray="8 8"
                />
              );
            })}
          </svg>

          {/* Integration icons */}
          {integrations.map((integration, i) => {
            const angle = (i * 60 - 90) * (Math.PI / 180);
            const x = 50 + 35 * Math.cos(angle);
            const y = 50 + 35 * Math.sin(angle);
            return (
              <div
                key={integration.name}
                className="absolute w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-card rounded-lg sm:rounded-xl md:rounded-2xl shadow-elevated flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <span className="text-lg sm:text-xl md:text-2xl">{integration.emoji}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default IntegrationsSection;
