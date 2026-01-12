import { MessageSquare, Link2, Magnet, ShoppingBag, ArrowRight } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "AutoDM",
    description: "Automatically reply to comments and DMs with personalized messages. Convert followers into customers.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Link2,
    title: "SuperLinks",
    description: "Create smart link-in-bio pages that drive traffic and conversions. Track clicks and optimize.",
    color: "bg-reely-orange/10 text-reely-orange",
  },
  {
    icon: Magnet,
    title: "Lead Magnet",
    description: "Capture emails and grow your list with irresistible lead magnets and automated delivery.",
    color: "bg-reely-green/10 text-reely-green",
  },
  {
    icon: ShoppingBag,
    title: "Link in Bio Store",
    description: "Sell digital products, courses, and services directly from your Instagram bio.",
    color: "bg-purple-500/10 text-purple-500",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-12 sm:py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            Reach more people
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            with tools built for <span className="text-primary font-semibold">growth</span>
          </p>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground px-2">
            Everything you need to grow your audience and build your brand.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="group glass-card rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 hover:shadow-glow transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl ${feature.color} flex items-center justify-center mb-4 sm:mb-6`}>
                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
              </div>
              
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">
                {feature.title}
              </h3>
              
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                {feature.description}
              </p>
              
              <a 
                href="#" 
                className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all text-sm sm:text-base"
              >
                Learn more <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
