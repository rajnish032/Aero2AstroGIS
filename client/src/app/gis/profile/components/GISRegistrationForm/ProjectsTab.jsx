import React, { useRef } from "react";
import Input from "../forms/Input";
import Textarea from "../forms/Textarea";
import FileUpload from "../forms/FileUpload";
import TabContent from "../forms/TabContent";

const ProjectsTab = ({
  formData,
  handleProjectChange,
  addProject,
  handleWorkSampleUpload,
  workSamples,
  setWorkSamples, // Added to handle file removal
  errors,
  savedTabs,
  isDraftMode, // Added for draft functionality
  tabRefs // Added for consistency
}) => {
  return (
    <TabContent
      title="Projects & Work Samples"
      tabNumber={5}
      isSaved={savedTabs.includes(5)}
    >
      <div className="md:col-span-2">
        <h4 className="text-lg font-medium text-gray-800 mb-2">
          Project Portfolio
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Provide details of at least 3 projects you've worked on.
        </p>
        
        {formData.projects.map((project, index) => (
          <div
            key={`project-${index}`}
            className="border p-4 rounded-lg mb-4 bg-gray-50 shadow-sm"
          >
            <h5 className="font-medium text-gray-800 mb-2">
              Project {index + 1}
            </h5>
            <Input
              ref={(el) => index === 0 && (tabRefs.current[4] = el)}
              name={`projectTitle${index}`}
              label="Project Title"
              value={project.title}
              onChange={(e) =>
                handleProjectChange(index, "title", e.target.value)
              }
              required
              error={errors[`projectTitle${index}`]}
              disabled={isDraftMode}
            />
            <Textarea
              name={`projectDesc${index}`}
              label="Description"
              value={project.description}
              onChange={(e) =>
                handleProjectChange(index, "description", e.target.value)
              }
              required
              disabled={isDraftMode}
            />
            <Input
              name={`projectTech${index}`}
              label="Technologies Used"
              value={project.technologies}
              onChange={(e) =>
                handleProjectChange(index, "technologies", e.target.value)
              }
              required
              disabled={isDraftMode}
            />
          </div>
        ))}

        {!isDraftMode && (
          <button
            type="button"
            onClick={addProject}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            + Add Another Project
          </button>
        )}
      </div>

      <div className="md:col-span-2 mt-6">
        <h4 className="text-lg font-medium text-gray-800 mb-2">
          Work Samples
        </h4>
        <FileUpload
          name="workSamples"
          label="Upload Work Samples (max 5 files)"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={handleWorkSampleUpload}
          multiple
          disabled={isDraftMode}
        />
        
        {workSamples.length > 0 && (
          <div className="mt-4">
            <h5 className="font-medium text-gray-800 mb-2">
              Selected Files:
            </h5>
            <ul className="list-disc pl-5">
              {workSamples.map((file, index) => (
                <li key={index} className="text-sm text-gray-700">
                  {file.name}
                  {!isDraftMode && (
                    <button
                      type="button"
                      onClick={() =>
                        setWorkSamples(workSamples.filter((_, i) => i !== index))
                      }
                      className="ml-2 text-red-500 hover:underline"
                    >
                      ×
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </TabContent>
  );
};

export default ProjectsTab;