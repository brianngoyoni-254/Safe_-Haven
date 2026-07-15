import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { keyframeStyles } from "../styles/theme";

import CrisisStrip from "../components/CrisisStrip";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import SunriseDivider from "../components/SunriseDivider";
import StatBand from "../components/StatBand";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import Story from "../components/Story";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

export default function LandingPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-sans">
      <style>{keyframeStyles}</style>
      <CrisisStrip />
      <Navbar isLoggedIn={isLoggedIn} navigate={navigate} />
      <Hero isLoggedIn={isLoggedIn} navigate={navigate} />
      <SunriseDivider />
      <StatBand />
      <Features />
      <HowItWorks />
      <Story />
      <CTA isLoggedIn={isLoggedIn} navigate={navigate} />
      <Footer />
    </div>
  );
}