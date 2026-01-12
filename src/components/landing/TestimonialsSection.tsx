import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "Building my paid community with ReelyChat was seamless. My audience loves it!",
    author: "Stephanie Gardner",
    role: "Social Media Marketing",
    avatar: "👩‍💼",
  },
  {
    quote: "AutoDM helped me 5x my engagement rate in just 2 weeks. Absolutely game-changing.",
    author: "Marcus Chen",
    role: "Content Creator",
    avatar: "👨‍💻",
  },
  {
    quote: "I've sold over $50k in digital products through ReelyChat. The best investment I've made.",
    author: "Priya Sharma",
    role: "Course Creator",
    avatar: "👩‍🎓",
  },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-12 sm:py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            Top choice of <span className="gradient-text">50,000+</span> creators
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            See what creators are saying about ReelyChat
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.author}
              className="bg-card rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-glass hover:shadow-elevated transition-shadow animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-reely-orange text-reely-orange" />
                ))}
              </div>
              
              <p className="text-sm sm:text-base text-foreground mb-4 sm:mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-full flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                  {testimonial.avatar}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm sm:text-base truncate">{testimonial.author}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
