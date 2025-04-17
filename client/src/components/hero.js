"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

const Hero = () => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const features = [
    {
      title: "Experienced and Professional Team",
      description:
        "Our team of highly experienced engineers works around the clock to provide you with the best service.",
      image: "/thejashari_KmtIitd5as.png",
    },
    {
      title: "Tailor-made Solutions",
      description:
        "Our solutions adapt to a wide range of applications with user-specific customization, ensuring optimal performance to meet your needs.",
      image: "/thejashari_KmtIitd5as.png",
    },
    {
      title: "5X Faster Data Delivery",
      description:
        "We’ve automated workflows to process and analyze data, delivering results on or before time.",
      image: "/thejashari_KmtIitd5as.png",
    },
    {
      title: "Asset Management Platform",
      description:
        "Store, manage, and collaborate on data in the cloud with real-time updates on assets and projects.",
      image: "/thejashari_KmtIitd5as.png",
    },
  ];

  return (
    <div className="relative bg-gradient-to-b from-gray-900 to-black text-white py-16 px-6 md:px-20 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.2),_transparent)]"></div>
      </div>

      {/* Heading */}
      <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-12 tracking-tight">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
          How We Stand Out
        </span>
      </h2>

      {/* Timeline Container */}
      <div className="relative flex flex-col items-center max-w-5xl mx-auto">
        {/* Timeline Line */}
        <div className="absolute w-1 bg-gradient-to-b from-blue-500 to-transparent h-full left-1/2 transform -translate-x-1/2"></div>

        {features.map((feature, index) => (
          <div
            key={index}
            className={`relative flex items-center w-full md:w-3/4 lg:w-2/3 mb-16 ${
              index % 2 === 0 ? "flex-row" : "flex-row-reverse"
            } group`} // Added group for hover effects
          >
            {/* Image Side */}
            <div className="w-1/2 flex justify-center px-4 md:px-8">
              <div className="relative">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  width={300}
                  height={300}
                  className={`rounded-xl shadow-lg border-2 border-gray-700 transition-all duration-500 ${
                    isHydrated ? "animate-slideIn opacity-100 scale-100" : "opacity-0 scale-95"
                  } group-hover:scale-105 group-hover:shadow-xl`} // Enhanced hover effect
                  priority
                />
                {/* Image Overlay Effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>

            {/* Text Side */}
            <div
              className={`relative bg-gray-800/80 backdrop-blur-md p-6 rounded-xl w-80 border border-gray-700/50 shadow-lg transition-all duration-500 ${
                isHydrated ? "animate-slideIn opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              } group-hover:shadow-xl group-hover:bg-gray-700/90 ${
                index % 2 === 0 ? "ml-8 md:ml-12" : "mr-8 md:mr-12"
              }`} // Enhanced card styling
            >
              <h3 className="text-xl font-semibold text-blue-400 tracking-wide">
                {feature.title}
              </h3>
              <p className="text-gray-300 mt-3 leading-relaxed text-sm md:text-base">
                {feature.description}
              </p>
            </div>

            {/* Timeline Dot */}
            <div
              className={`absolute w-5 h-5 bg-blue-500 rounded-full left-1/2 transform -translate-x-1/2 border-4 border-gray-900 transition-all duration-300 ${
                isHydrated ? "scale-100 opacity-100" : "scale-50 opacity-0"
              } group-hover:scale-125 group-hover:bg-blue-400`} // Animated dot
            >
              <div className="absolute inset-0 rounded-full bg-blue-400/30 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hero;


