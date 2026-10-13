import { Hero } from '@/components/Hero';
import { QuickQuoteSimulator } from '@/components/QuickQuoteSimulator';
import { CategoriesSection } from '@/components/CategoriesSection';
import { DifferentialsSection } from '@/components/DifferentialsSection';
import { CorporateEventsSection } from '@/components/CorporateEventsSection';
import { HowItWorks } from '@/components/HowItWorks';
import { PortfolioSection } from '@/components/PortfolioSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { FaqSection } from '@/components/FaqSection';

export default function HomePage() {
  return (
    <div className="space-y-0">
      <Hero />
      <QuickQuoteSimulator />
      <CategoriesSection />
      <HowItWorks />
      <CorporateEventsSection />
      <DifferentialsSection />
      <PortfolioSection />
      <TestimonialsSection />
      <FaqSection />
    </div>
  );
}
