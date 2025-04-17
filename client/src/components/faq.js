"use client";
import { useEffect, useState } from "react";
import Accordion from "./Accordion";

const FAQ = () => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <section
      className="relative bg-gradient-to-b from-gray-900 to-black text-white w-full min-h-screen flex flex-col justify-center py-16 px-6 md:px-20 overflow-hidden"
      id="faq"
    >
      {/* Subtle Background Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.2),_transparent)]"></div>
      </div>

      {/* Heading */}
      <h3 className="text-4xl md:text-5xl font-extrabold text-center mb-12 tracking-tight">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
          Frequently Asked Questions
        </span>
      </h3>

      {/* FAQ Container */}
      <div className="max-w-4xl mx-auto w-full relative z-10">
        {faqData.map((faq, index) => (
          <div
            key={index}
            className={`transition-all duration-500 ${
              isHydrated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`} // Fade-in animation
            style={{ transitionDelay: `${index * 100}ms` }} // Staggered animation
          >
            <Accordion title={faq.title} answer={faq.answer} index={index} />
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-[1px] w-full mt-4 opacity-50"></div>
          </div>
        ))}
      </div>

      {/* Call-to-Action */}
      <div className="text-center mt-12 relative z-10">
        <p className="text-gray-400 mb-4">
          Still have questions? We’re here to help!
        </p>
        <a
          href="tel:+916006535445"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
        >
          Contact Us at +91 6006535445
        </a>
      </div>
    </section>
  );
};

const faqData = [
  {
    title: "Can I Register if I don't have Drones?",
    answer: "Yes, you are welcome. All we want is relevant Pilot skills.",
  },
  {
    title: "Can I Register if I don't have a Pilot License?",
    answer: "Yes, you are welcome, you will be eligible to receive jobs.",
  },
  {
    title: "Do I have to relocate?",
    answer:
      "No, you can work from anywhere. We will provide you with jobs that match your service range and chosen areas.",
  },
  {
    title: "What are the service areas used for?",
    answer:
      "Service areas inform us where you prefer to fly your missions. This does not prevent you from receiving missions outside of this area. Our Pilot Success team may send you missions regardless of the service area you provide.",
  },
  {
    title: "Who owns the data that you collect?",
    answer:
      "Aero2Astro owns all data collected using our technology unless otherwise specified by the client.",
  },
  {
    title: "What is your average turnaround time?",
    answer:
      "Projects are typically ready within 2-5 business days with an ASAP mindset.",
  },
  {
    title: "How will I access my data?",
    answer:
      "Data is accessed through our proprietary portal or a viewable link to online deliverables. We can also use API tools to access existing systems for ease of delivery.",
  },
  {
    title: "Do you service my area?",
    answer:
      "If you are within INDIA, absolutely! All inquiries originating outside INDIA will be considered on an individual basis.",
  },
  {
    title: "What packages do you offer for my industry?",
    answer:
      "Aero2Astro does have set packages as per Industry Market standards. For more details, you can contact us at +91 6006535445.",
  },
  {
    title: "What happens if I do not complete the registration process?",
    answer:
      "You will not be able to accept or reject a mission for which you may be eligible. You can complete the registration process by clicking the Finish Setup button or Registering through the form.",
  },
  {
    title: "How do I change my password?",
    answer:
      "You can change your password on the login page using the Forgot Password option.",
  },
  {
    title: "How do I update my profile?",
    answer:
      "You can change your profile before applying on the dashboard, profile page.",
  },
];

export default FAQ;

