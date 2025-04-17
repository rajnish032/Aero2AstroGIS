"use client";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa"; // Using react-icons for a better icon

const Accordion = ({ title, answer, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`group bg-gray-800/50 backdrop-blur-md rounded-xl border border-gray-700/50 shadow-lg my-4 transition-all duration-300 ${
        isOpen ? "bg-gray-700/90 border-blue-500/50" : "hover:bg-gray-700/70"
      }`} // Highlight active accordion
      role="region"
      aria-labelledby={`faq-title-${index}`}
    >
      {/* Accordion Header */}
      <button
        onClick={toggleAccordion}
        className="flex justify-between items-center w-full p-5 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${index}`}
        id={`faq-title-${index}`}
      >
        <h4 className="text-lg font-semibold text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
          {title}
        </h4>
        <span
          className={`text-blue-400 transform transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        >
          <FaChevronDown className="w-5 h-5" />
        </span>
      </button>

      {/* Accordion Content */}
      <div
        id={`faq-answer-${index}`}
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-5 pt-0 text-gray-300 text-sm md:text-base leading-relaxed border-t border-gray-700/50">
          {answer}
        </div>
      </div>
    </div>
  );
};

export default Accordion;