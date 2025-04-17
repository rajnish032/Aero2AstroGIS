import React, { useRef } from "react";
import Checkbox from "../forms/Checkbox";
import TabContent from "../forms/TabContent";

const TermsTab = ({
  formData,
  handleChange,
  errors,
  savedTabs,
  isSubmitting,
  setActiveTab,
  isDraftMode, // Added for draft functionality
  tabRefs // Added for consistency
}) => {
  return (
    <TabContent
      title="Terms & Conditions"
      tabNumber={8}
      isSaved={savedTabs.includes(8)}
    >
      <div className="md:col-span-2">
        <h4 className="text-lg font-medium text-gray-800 mb-2">
          Terms & Conditions
        </h4>
        <div className="border p-4 rounded-lg mb-4 bg-gray-50 shadow-sm max-h-60 overflow-y-auto">
          <h5 className="font-medium text-gray-800 mb-2">
            Privacy Policy
          </h5>
          <p className="text-sm text-gray-600 mb-4">
            By submitting this form, you agree to our Privacy Policy...
          </p>
          <h5 className="font-medium text-gray-800 mb-2">
            Terms of Service
          </h5>
          <p className="text-sm text-gray-600">
            You certify that all information provided is accurate...
          </p>
        </div>
        
        <div className="mb-4">
          <Checkbox
            ref={(el) => (tabRefs.current[7] = el)}
            name="acceptTerms"
            label={
              <span>
                I agree to the{" "}
                <a
                  href="/terms"
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>{" "}
                *
              </span>
            }
            checked={formData.acceptTerms}
            onChange={handleChange}
            disabled={isDraftMode}
          />
          {errors.acceptTerms && (
            <p className="text-red-500 text-xs mt-1">
              {errors.acceptTerms}
            </p>
          )}
        </div>
        
        <Checkbox
          name="consentMarketing"
          label="I agree to receive newsletters and updates"
          checked={formData.consentMarketing}
          onChange={handleChange}
          disabled={isDraftMode}
        />
        
        <div className="flex justify-between items-center mt-6">
          {!isDraftMode && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab(1)}
                className="text-blue-600 hover:underline"
              >
                ← Review My Information
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-200 disabled:bg-gray-400"
              >
                {isSubmitting ? "Submitting..." : "Submit Registration"}
              </button>
            </>
          )}
          {isDraftMode && (
            <button
              type="button"
              onClick={() => setIsDraftMode(false)}
              className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition duration-200"
            >
              Edit Draft
            </button>
          )}
        </div>
      </div>
    </TabContent>
  );
};

export default TermsTab;