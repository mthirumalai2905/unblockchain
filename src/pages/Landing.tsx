import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LandingHero from "@/components/landing/LandingHero";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingHowItWorks from "@/components/landing/LandingHowItWorks";
import LandingTestimonials from "@/components/landing/LandingTestimonials";
import LandingPricing from "@/components/landing/LandingPricing";
import LandingCTA from "@/components/landing/LandingCTA";
import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";
import { DotBackground } from "@/components/ui/dot-background";

const Landing = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="landing-page landing-atmosphere min-h-[100svh] text-foreground overflow-x-clip relative">
      <DotBackground className="fixed inset-0 z-0 opacity-30" fade={false} size={22} />

      <div className="relative z-10 w-full min-w-0">
        <LandingNav />
        <main>
          <LandingHero />
          <LandingHowItWorks />
          <LandingFeatures />
          <LandingTestimonials />
          <LandingPricing />
          <LandingCTA />
        </main>
        <LandingFooter />
      </div>
    </div>
  );
};

export default Landing;
