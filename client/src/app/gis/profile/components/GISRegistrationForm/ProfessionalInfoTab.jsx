import React, { useRef } from "react";
import Input from "../forms/Input";
import Select from "../forms/Select";
import Textarea from "../forms/Textarea";
import TabContent from "../forms/TabContent";

const ProfessionalInfoTab = ({
  formData,
  handleChange,
  errors,
  savedTabs,
  isDraftMode, // Added for draft functionality
  tabRefs // Added for consistency
}) => {
  return (
    <TabContent
      title="Professional Information"
      tabNumber={4}
      isSaved={savedTabs.includes(4)}
    >
      <Input
        ref={(el) => (tabRefs.current[3] = el)}
        name="experience"
        label="Years of Experience"
        type="number"
        min="0"
        value={formData.experience}
        onChange={handleChange}
        disabled={isDraftMode}
      />
      
      <Input
        name="organization"
        label="Current Organization"
        value={formData.organization}
        onChange={handleChange}
        disabled={isDraftMode}
      />
      
      <Select
        name="employer"
        label="Employment Type"
        value={formData.employer}
        onChange={handleChange}
        options={[
          "Full-time",
          "Part-time",
          "Freelancer",
          "Student",
          "Unemployed",
          "Other",
        ]}
        disabled={isDraftMode}
      />
      
      <Input
        name="jobTitle"
        label="Current Job Title"
        value={formData.jobTitle}
        onChange={handleChange}
        disabled={isDraftMode}
      />
      
      <Input
        name="linkedIn"
        label="LinkedIn Profile URL"
        type="url"
        value={formData.linkedIn}
        onChange={handleChange}
        disabled={isDraftMode}
      />
      
      <Input
        name="portfolio"
        label="Portfolio Website"
        type="url"
        value={formData.portfolio}
        onChange={handleChange}
        disabled={isDraftMode}
      />
      
      <Textarea
        name="skills"
        label="Key Skills Summary"
        placeholder="Brief summary of your key skills"
        value={formData.skills}
        onChange={handleChange}
        disabled={isDraftMode}
      />
    </TabContent>
  );
};

export default ProfessionalInfoTab;