import React, { useRef } from "react";
import Input from "../forms/Input";
import Select from "../forms/Select";
import Checkbox from "../forms/Checkbox";
import TabContent from "../forms/TabContent";

const AvailabilityTab = ({
  formData,
  handleChange,
  handleArrayChange,
  errors,
  savedTabs,
  isDraftMode, // Added for draft functionality
  tabRefs // Added for consistency
}) => {
  return (
    <TabContent
      title="Availability & Preferences"
      tabNumber={7}
      isSaved={savedTabs.includes(7)}
    >
      <div className="md:col-span-2">
        <h4 className="text-lg font-medium text-gray-800 mb-2">
          Work Availability & Preferences
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            ref={(el) => (tabRefs.current[6] = el)}
            name="workMode"
            label="Preferred Work Mode"
            value={formData.workMode}
            onChange={handleChange}
            options={["Remote", "On-site", "Hybrid"]}
            disabled={isDraftMode}
          />
          
          <Select
            name="workType"
            label="Preferred Work Type"
            value={formData.workType}
            onChange={handleChange}
            options={["Full-time", "Part-time", "Contract", "Freelance"]}
            disabled={isDraftMode}
          />
          
          <Select
            name="availability"
            label="Current Availability"
            value={formData.availability}
            onChange={handleChange}
            options={[
              "Immediately Available",
              "Available in 1-2 weeks",
              "Available in 1 month",
              "Not currently available",
            ]}
            disabled={isDraftMode}
          />
          
          <Select
            name="travelWillingness"
            label="Willingness to Travel"
            value={formData.travelWillingness}
            onChange={handleChange}
            options={["Yes", "No", "Limited"]}
            disabled={isDraftMode}
          />
          
          <Input
            name="workHours"
            label="Preferred Working Hours"
            placeholder="e.g., 9am-5pm"
            value={formData.workHours}
            onChange={handleChange}
            disabled={isDraftMode}
          />
          
          <Input
            name="preferredTimeZones"
            label="Preferred Time Zone(s)"
            placeholder="e.g., IST, EST"
            value={formData.preferredTimeZones}
            onChange={handleChange}
            disabled={isDraftMode}
          />
          
          <div className="md:col-span-2">
            <h5 className="font-medium text-gray-800 mb-2">
              Preferred Service Delivery Modes
            </h5>
            <div className="flex flex-wrap gap-4">
              {["Online", "On-site", "Hybrid", "Consultation"].map((mode) => (
                <Checkbox
                  key={mode}
                  name="serviceModes"
                  value={mode}
                  label={mode}
                  checked={formData.serviceModes.includes(mode)}
                  onChange={(e) => handleArrayChange(e, "serviceModes")}
                  disabled={isDraftMode}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </TabContent>
  );
};

export default AvailabilityTab;