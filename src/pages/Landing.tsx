import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LandingHero from "@/components/landing/LandingHero";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingStats from "@/components/landing/LandingStats";
import LandingHowItWorks from "@/components/landing/LandingHowItWorks";
import LandingTestimonials from "@/components/landing/LandingTestimonials";
import LandingIntegrations from "@/components/landing/LandingIntegrations";
import LandingPricing from "@/components/landing/LandingPricing";
import LandingCTA from "@/components/landing/LandingCTA";
import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";

const Landing = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Grain texture */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
      }} />

      {/* Grid overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(hsl(0 0% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 50%) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }} />

      <LandingNav />
      <LandingHero />
      <LandingStats />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingTestimonials />
      <LandingIntegrations />
      <LandingPricing />
      <LandingCTA />
      <LandingFooter />
    </div>
  );
};

export default Landing;
