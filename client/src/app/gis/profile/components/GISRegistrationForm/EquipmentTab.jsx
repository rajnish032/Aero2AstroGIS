import React, { useRef } from "react";
import Input from "../forms/Input";
import Checkbox from "../forms/Checkbox";
import Select from "../forms/Select";
import FileUpload from "../forms/FileUpload";
import TabContent from "../forms/TabContent";
import Textarea from "../forms/Textarea";

const EquipmentTab = ({
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
      title="Equipment & Hardware"
      tabNumber={6}
      isSaved={savedTabs.includes(6)}
    >
      <div className="md:col-span-2">
        <h4 className="text-lg font-medium text-gray-800 mb-2">
          Equipment Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-800 mb-2">
              Do you own any GIS/surveying equipment?
            </h5>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  ref={(el) => (tabRefs.current[5] = el)}
                  type="radio"
                  name="ownEquipment"
                  value="Yes"
                  checked={formData.ownEquipment === "Yes"}
                  onChange={handleChange}
                  className="mr-2"
                  disabled={isDraftMode}
                />{" "}
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="ownEquipment"
                  value="No"
                  checked={formData.ownEquipment === "No"}
                  onChange={handleChange}
                  className="mr-2"
                  disabled={isDraftMode}
                />{" "}
                No
              </label>
            </div>
          </div>
          
          {formData.ownEquipment === "Yes" && (
            <>
              <div>
                <h5 className="font-medium text-gray-800 mb-2">
                  Available Equipment
                </h5>
                {[
                  "GPS Receiver",
                  "Total Station",
                  "Drone/UAV",
                  "3D Scanner",
                  "Survey Grade Tablet",
                  "Laser Distance Meter",
                  "Other",
                ].map((equipment) => (
                  <Checkbox
                    key={equipment}
                    name="availableEquipment"
                    value={equipment}
                    label={equipment}
                    checked={formData.availableEquipment.includes(equipment)}
                    onChange={(e) => handleArrayChange(e, "availableEquipment")}
                    disabled={isDraftMode}
                  />
                ))}
              </div>
              
              <Input
                name="equipmentName"
                label="Primary Equipment Name/Model"
                value={formData.equipmentName}
                onChange={handleChange}
                disabled={isDraftMode}
              />
              
              <Input
                name="equipmentBrand"
                label="Brand/Manufacturer"
                value={formData.equipmentBrand}
                onChange={handleChange}
                disabled={isDraftMode}
              />
              
              <Input
                name="equipmentYear"
                label="Year of Purchase"
                type="number"
                min="2000"
                max={new Date().getFullYear()}
                value={formData.equipmentYear}
                onChange={handleChange}
                disabled={isDraftMode}
              />
              
              <Textarea
                name="equipmentSpecs"
                label="Equipment Specifications"
                value={formData.equipmentSpecs}
                onChange={handleChange}
                className="md:col-span-2"
                disabled={isDraftMode}
              />
              
              <Select
                name="maintenanceSchedule"
                label="Maintenance Schedule"
                value={formData.maintenanceSchedule}
                onChange={handleChange}
                options={[
                  "Monthly",
                  "Quarterly",
                  "Bi-annually",
                  "Annually",
                  "As needed",
                ]}
                className="md:col-span-2"
                disabled={isDraftMode}
              />
              
              <div className="md:col-span-2">
                <h5 className="font-medium text-gray-800 mb-2">
                  Drone Certification
                </h5>
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="droneCertification"
                      value="Yes"
                      checked={formData.droneCertification === "Yes"}
                      onChange={handleChange}
                      className="mr-2"
                      disabled={isDraftMode}
                    />{" "}
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="droneCertification"
                      value="No"
                      checked={formData.droneCertification === "No"}
                      onChange={handleChange}
                      className="mr-2"
                      disabled={isDraftMode}
                    />{" "}
                    No
                  </label>
                </div>
                
                {formData.droneCertification === "Yes" && (
                  <FileUpload
                    name="certificationFile"
                    label="Upload Certification"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleChange}
                    disabled={isDraftMode}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </TabContent>
  );
};

export default EquipmentTab;