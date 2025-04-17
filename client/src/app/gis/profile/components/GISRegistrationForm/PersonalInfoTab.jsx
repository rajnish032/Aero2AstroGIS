"use client";
import React, { useRef, useEffect } from "react";
import Input from "../forms/Input";
import Select from "../forms/Select";
import Textarea from "../forms/Textarea";
import TabContent from "../forms/TabContent";
import { useGetUserQuery } from "@/lib/services/auth";

const PersonalInfoTab = ({
  formData,
  handleChange,
  handleImageUpload,
  errors,
  savedTabs,
  setFormData,
  isDraftMode, // Add this prop for draft functionality
  tabRefs // Add this prop
}) => {
  const { data: userData, isSuccess } = useGetUserQuery();

  useEffect(() => {
    if (isSuccess && userData) {
      const user = userData.user || userData;
      setFormData(prev => ({
        ...prev,
        // These fields will remain disabled as they come from user profile
        fullName: user.name || prev.fullName,
        contactNumber: user.phoneNumber || prev.contactNumber,
        email: user.email || prev.email,
        countryCode: user.countryCode || prev.countryCode,
        locality: user.locality || prev.locality,
        pinCode: user.areaPin || prev.pinCode,
        city: user.city || prev.city,
        state: user.state || prev.state,
        // Address will be editable even if parts come from user profile
        address: prev.address || `${user.locality || ''}, ${user.areaPin || ''}`.trim()
      }));
    }
  }, [isSuccess, userData, setFormData]);

  // Fields that should always be disabled (from user profile)
  const alwaysDisabledFields = [
    'fullName', 'email', 'contactNumber', 
    'countryCode', 'locality', 'pinCode',
    'city', 'state'
  ];

  return (
    <TabContent
      title="Personal Information"
      tabNumber={1}
      isSaved={savedTabs.includes(1)}
    >
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Profile Picture
        </label>
        <input
          ref={(el) => (tabRefs.current[0] = el)}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full p-2 border rounded-lg bg-gray-50"
          disabled={isDraftMode}
        />
        {formData.profileImage && (
          <div className="mt-2 flex items-center">
            <img
              src={
                formData.profileImage instanceof File
                  ? URL.createObjectURL(formData.profileImage)
                  : formData.profileImage
              }
              alt="Profile Preview"
              className="w-24 h-24 rounded-full border object-cover shadow-sm"
            />
            {!isDraftMode && (
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, profileImage: null }))
                }
                className="ml-4 text-red-500 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Always disabled fields (from user profile) */}
      <Input
        name="fullName"
        label="Full Name"
        value={formData.fullName}
        onChange={handleChange}
        required
        error={errors.fullName}
        disabled
      />
      
      <Input
        name="email"
        type="email"
        label="Email"
        value={formData.email}
        onChange={handleChange}
        required
        error={errors.email}
        disabled
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            name="countryCode"
            label="Country Code"
            value={formData.countryCode || "+91"}
            onChange={handleChange}
            disabled
          />
        </div>
        <div>
          <Input
            name="contactNumber"
            type="tel"
            label="Contact Number"
            value={formData.contactNumber}
            onChange={handleChange}
            required
            error={errors.contactNumber}
            disabled
          />
        </div>
      </div>
      
      {/* Fields that will be disabled only in draft mode */}
      <Input
        name="dob"
        type="date"
        label="Date of Birth"
        value={formData.dob}
        onChange={handleChange}
        required
        error={errors.dob}
        disabled={isDraftMode}
      />
      
      <Select
        name="gender"
        label="Gender"
        value={formData.gender}
        onChange={handleChange}
        options={["Male", "Female", "Other", "Prefer not to say"]}
        required
        disabled={isDraftMode}
      />
      
      <Select
        name="nationality"
        label="Nationality"
        value={formData.nationality}
        onChange={handleChange}
        options={[
          "Indian",
          "American",
          "Canadian",
          "British",
          "Australian",
          "Other",
        ]}
        required
        disabled={isDraftMode}
      />
      
      <div className="md:col-span-2">
        <h4 className="text-lg font-medium text-gray-800 mb-2">
          Address Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Textarea
            name="address"
            label="Street Address"
            value={formData.address}
            onChange={handleChange}
            required
            error={errors.address}
            disabled={isDraftMode}
          />
          
          {/* Always disabled fields (from user profile) */}
          <Input
            name="locality"
            label="Locality"
            value={formData.locality || ""}
            onChange={handleChange}
            disabled
          />
          
          <Input
            name="pinCode"
            label="Pin Code"
            value={formData.pinCode}
            onChange={handleChange}
            required
            error={errors.pinCode}
            disabled
          />
          
          <Input
            name="city"
            label="City"
            value={formData.city}
            onChange={handleChange}
            required
            disabled
          />
          
          <Input
            name="state"
            label="State/Province"
            value={formData.state}
            onChange={handleChange}
            required
            disabled
          />
        </div>
      </div>
    </TabContent>
  );
};

export default PersonalInfoTab;