"use client";
import { useEffect, useState } from "react";
import FAQ from "@/components/faq";
import FeatureSection from "@/components/featureSection";
import { Feedback } from "@/components/feedback";
import Hero from "@/components/hero";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import Register from "@/components/header";

const featuresData = [
  {
    id: 1,
    title: "🚀 Work on Cutting-Edge Projects",
    description:
      "Gain access to real-world geospatial datasets and process drone imagery, LiDAR, and GIS data.",
    image: "/landingpage/assests/istockphoto-1337105633-612x612.jpg",
    alt: "Capture image",
  },
  {
    id: 2,
    title: "💰 Earn Recognition & Rewards",
    description:
      "Get certified, build your reputation, and unlock high-paying opportunities.",
    image: "/landingpage/assests/download (1).jpeg",
    alt: "Industry Insights",
  },
  {
    id: 3,
    title: "🌍 Be Part of an Exclusive Community",
    description:
      "Connect with top geospatial experts and collaborate on global projects.",
    image: "/landingpage/assests/hannah-busing-Zyx1bK9mqmA-unsplash.jpg",
    alt: "Smart Cities",
  },
  {
    id: 4,
    title: "📈 Advance Your Career",
    description:
      "Create a verified portfolio, gain exposure, and establish credibility in the industry.",
    image: "/landingpage/assests/360_F_444393374_40Fs9t5kUMHVQBx6mXpTY8eRAGo6og97.jpg",
    alt: "Smart Cities",
  },
];

export default function Home() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <main className={isHydrated ? "hydrated" : ""}>
      {isHydrated ? (
        <>
          <Navbar />
          <Register />
          <FeatureSection features={featuresData} />
          <Hero />
          <FAQ />
          <Feedback />
          <Footer />
        </>
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-center">
            <h1 className="text-3xl font-semibold text-blue-400">
              Loading Aero2Astro GIS...
            </h1>
            <div className="mt-4 h-2 w-48 bg-gray-700 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
    </main>
  );
}
