import React, { useRef } from "react";
import Input from "../forms/Input";
import Textarea from "../forms/Textarea";
import TabContent from "../forms/TabContent";

const EducationTab = ({
  formData,
  handleChange,
  errors,
  savedTabs,
  isDraftMode, // Add this prop for draft functionality
  tabRefs // Add this prop for consistency
}) => {
  return (
    <TabContent
      title="Educational Background"
      tabNumber={2}
      isSaved={savedTabs.includes(2)}
    >
      <Input
        ref={(el) => (tabRefs.current[0] = el)}
        name="institution"
        label="University/Institute Name"
        value={formData.institution}
        onChange={handleChange}
        required
        error={errors.institution}
        disabled={isDraftMode}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          name="education"
          label="Highest Qualification"
          value={formData.education}
          onChange={handleChange}
          disabled={isDraftMode}
        />
        
        <Input
          name="fieldOfStudy"
          label="Field of Study"
          value={formData.fieldOfStudy}
          onChange={handleChange}
          required
          error={errors.fieldOfStudy}
          disabled={isDraftMode}
        />
        
        <Input
          name="year"
          label="Year of Graduation"
          type="number"
          min="1900"
          max="2099"
          value={formData.year}
          onChange={handleChange}
          disabled={isDraftMode}
        />
      </div>
      
      <Textarea
        name="certifications"
        label="Certifications (comma separated)"
        placeholder="e.g., GIS Professional Certification"
        value={formData.certifications}
        onChange={handleChange}
        className="md:col-span-2"
        disabled={isDraftMode}
      />
    </TabContent>
  );
};

export default EducationTab;