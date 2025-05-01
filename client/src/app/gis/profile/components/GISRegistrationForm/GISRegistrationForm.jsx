"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import PersonalInfoTab from "./PersonalInfoTab";
import EducationTab from "./EducationTab";
import TechnicalSkillsTab from "./TechnicalSkillsTab";
import ProfessionalInfoTab from "./ProfessionalInfoTab";
import ProjectsTab from "./ProjectsTab";
import EquipmentTab from "./EquipmentTab";
import AvailabilityTab from "./AvailabilityTab";
import TermsTab from "./TermsTab";
import { useGetUserQuery } from "@/lib/services/auth";

const createInitialFormData = (userData) => ({
  fullName: userData?.name || "",
  dob: "",
  gender: "Male",
  contactNumber: userData?.phoneNumber || "",
  countryCode: userData?.countryCode || "+91",
  email: userData?.email || "",
  nationality: "Indian",
  profileImage: null,
  address: userData?.address || "",
  pinCode: userData?.areaPin || "",
  locality: userData?.locality || "",
  city: userData?.city || "",
  state: userData?.state || "",
  institution: "",
  education: "Bachelor's Degree",
  certifications: [],
  fieldOfStudy: "Geoinformatics",
  year: new Date().getFullYear().toString(),
  gisSoftware: ["QGIS"],
  gisSoftwareOther: "",
  programmingSkills: [],
  programmingSkillsOther: "",
  CoreExpertise: [],
  CoreExpertiseOther: "",
  droneDataProcessing: "Beginner",
  photogrammetrySoftware: [],
  photogrammetrySoftwareOther: "",
  remoteSensing: "Beginner",
  lidarProcessing: "Beginner",
  experience: "1",
  organization: "",
  employer: "Freelancer",
  linkedIn: "",
  portfolio: "",
  jobTitle: "GIS Specialist",
  skills: ["GIS Analysis"],
  workMode: "Remote",
  workType: "Full-time",
  workHours: "9am-5pm",
  availability: "Full-time",
  travelWillingness: "Yes",
  preferredTimeZones: "IST",
  serviceModes: ["Online"],
  projects: [
    { title: "", description: "", technologies: "" },
    { title: "", description: "", technologies: "" },
    { title: "", description: "", technologies: "" },
  ],
  ownEquipment: "No",
  availableEquipment: [],
  equipmentName: "",
  equipmentBrand: "",
  equipmentYear: "",
  equipmentSpecs: "",
  maintenanceSchedule: "Annual",
  droneCertification: "No",
  equipmentRental: "No",
  rentalTerms: "",
  acceptTerms: false,
  consentMarketing: false,
});

export default function GISRegistrationForm() {
  const router = useRouter();
  const { data: userData, isSuccess: userDataLoaded, error: userError, isFetching } = useGetUserQuery();
  const [activeTab, setActiveTab] = useState(1);
  const [workSamples, setWorkSamples] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedTabs, setSavedTabs] = useState([]);
  const [disabledTabs, setDisabledTabs] = useState([]);
  const [hasDraft, setHasDraft] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [serverMessage, setServerMessage] = useState({ type: "", message: "" });
  const [visitedTabs, setVisitedTabs] = useState(new Set([1]));
  const tabRefs = useRef(Array(8).fill(null));
  const [formData, setFormData] = useState(createInitialFormData());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    console.log('Component mounting, userData:', userData, 'userError:', userError, 'isFetching:', isFetching);
    setIsMounted(true);
    if (userDataLoaded && !isFetching) {
      console.log('User data loaded, loading draft...');
      loadDraftData();
    }
    if (userError) {
      console.error('User fetch error:', userError);
      setServerMessage({
        type: "error",
        message: userError.status === 401 
          ? "Session expired. Please login again."
          : "Failed to load user data. Please try again."
      });
      setIsLoading(false);
      if (userError.status === 401) {
        router.push("/account/login");
      }
    }
  }, [userDataLoaded, userError, isFetching, router]);

  useEffect(() => {
    if (userDataLoaded && userData?.user) {
      console.log('Updating form data with user:', userData.user);
      setFormData(prev => ({
        ...prev,
        fullName: userData.user.name || prev.fullName,
        contactNumber: userData.user.phoneNumber || prev.contactNumber,
        countryCode: userData.user.countryCode || prev.countryCode,
        email: userData.user.email || prev.email,
        address: userData.user.address || prev.address,
        pinCode: userData.user.areaPin || prev.pinCode,
        locality: userData.user.locality || prev.locality,
        city: userData.user.city || prev.city,
        state: userData.user.state || prev.state
      }));
    }
  }, [userData, userDataLoaded]);

  const loadDraftData = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching draft data...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/gis-registration/draft`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
      });

      console.log('Draft fetch response:', response.status);
      if (response.ok) {
        const { exists, draftData } = await response.json();
        console.log('Draft data:', { exists, draftData });
        
        if (exists && draftData) {
          const parsedProjects = 
            typeof draftData.projects === 'string' 
              ? JSON.parse(draftData.projects) 
              : draftData.projects || createInitialFormData(userData?.user).projects;
          
          const parsedSavedTabs = 
            typeof draftData.savedTabs === 'string'
              ? JSON.parse(draftData.savedTabs).map(Number)
              : (draftData.savedTabs || []).map(Number);

          setFormData(prev => ({
            ...createInitialFormData(userData?.user),
            ...draftData,
            projects: parsedProjects,
            savedTabs: parsedSavedTabs,
            fullName: userData?.user?.name || draftData.fullName || "",
            contactNumber: userData?.user?.phoneNumber || draftData.contactNumber || "",
            email: userData?.user?.email || draftData.email || ""
          }));
          
          setActiveTab(draftData.lastSavedTab || 1);
          setSavedTabs(parsedSavedTabs);
          setDisabledTabs(parsedSavedTabs);
          setHasDraft(true);
        } else {
          setHasDraft(false);
        }
      } else if (response.status === 401) {
        console.error('Unauthorized draft fetch');
        setServerMessage({
          type: "error",
          message: "Session expired. Please login again."
        });
        router.push("/account/login");
      } else {
        console.error('Draft fetch failed:', response.status);
        setHasDraft(false);
      }
    } catch (error) {
      console.error("Error loading draft:", error);
      setHasDraft(false);
      setServerMessage({
        type: "error",
        message: "Failed to load draft data: " + error.message
      });
    } finally {
      setIsLoading(false);
    }
  }, [userData, router]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked, files } = e.target;
    console.log('Handling change:', { name, value, type });
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else if (name === "dob") {
      if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        setErrors((prev) => ({
          ...prev,
          dob: "Date of birth must be in YYYY-MM-DD format (e.g., 1990-01-01)",
        }));
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, dob: "" }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  }, []);

  const handleArrayChange = useCallback((e, field) => {
    const { value, checked } = e.target;
    console.log('Handling array change:', { field, value, checked });
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter((item) => item !== value),
    }));
  }, []);

  const handleProjectChange = useCallback((index, field, value) => {
    console.log('Handling project change:', { index, field, value });
    setFormData((prev) => {
      const updatedProjects = [...prev.projects];
      updatedProjects[index] = { ...updatedProjects[index], [field]: value };
      return { ...prev, projects: updatedProjects };
    });
  }, []);

  const addProject = useCallback(() => {
    console.log('Adding new project');
    setFormData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        { title: "", description: "", technologies: "" },
      ],
    }));
  }, []);

  const handleWorkSampleUpload = useCallback(
    (e) => {
      const files = Array.from(e.target.files);
      console.log('Uploading work samples:', files.length);
      if (files.length + workSamples.length > 5) {
        setServerMessage({
          type: "error",
          message: "Maximum 5 work samples allowed",
        });
        return;
      }
      setWorkSamples((prev) => [...prev, ...files]);
    },
    [workSamples]
  );

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    console.log('Uploading profile image:', file?.name);
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setServerMessage({
        type: "error",
        message: "Only JPEG or PNG images are allowed",
      });
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setServerMessage({
        type: "error",
        message: "Profile image must be less than 3MB",
      });
      return;
    }
    setFormData((prev) => ({ ...prev, profileImage: file }));
  }, []);

  const getTabData = (tabNumber, formData) => {
    console.log('Getting tab data for tab:', tabNumber);
    switch (tabNumber) {
      case 1:
        return {
          fullName: formData.fullName,
          dob: formData.dob,
          gender: formData.gender,
          contactNumber: formData.contactNumber,
          email: formData.email,
          nationality: formData.nationality,
          profileImage: formData.profileImage,
          address: formData.address,
          pinCode: formData.pinCode,
          city: formData.city,
          state: formData.state,
        };
      case 2:
        return {
          institution: formData.institution,
          education: formData.education,
          certifications: formData.certifications,
          fieldOfStudy: formData.fieldOfStudy,
          year: formData.year,
        };
      case 3:
        return {
          gisSoftware: formData.gisSoftware,
          gisSoftwareOther: formData.gisSoftwareOther,
          programmingSkills: formData.programmingSkills,
          programmingSkillsOther: formData.programmingSkillsOther,
          CoreExpertise: formData.CoreExpertise,
          CoreExpertiseOther: formData.CoreExpertiseOther,
          droneDataProcessing: formData.droneDataProcessing,
          photogrammetrySoftware: formData.photogrammetrySoftware,
          photogrammetrySoftwareOther: formData.photogrammetrySoftwareOther,
          remoteSensing: formData.remoteSensing,
          lidarProcessing: formData.lidarProcessing,
        };
      case 4:
        return {
          experience: formData.experience,
          organization: formData.organization,
          employer: formData.employer,
          linkedIn: formData.linkedIn,
          portfolio: formData.portfolio,
          jobTitle: formData.jobTitle,
          skills: formData.skills,
        };
      case 5:
        return {
          projects: formData.projects,
          workSamples: formData.workSamples,
        };
      case 6:
        return {
          ownEquipment: formData.ownEquipment,
          availableEquipment: formData.availableEquipment,
          equipmentName: formData.equipmentName,
          equipmentBrand: formData.equipmentBrand,
          equipmentYear: formData.equipmentYear,
          equipmentSpecs: formData.equipmentSpecs,
          maintenanceSchedule: formData.maintenanceSchedule,
          droneCertification: formData.droneCertification,
          certificationFile: formData.certificationFile,
        };
      case 7:
        return {
          workMode: formData.workMode,
          workType: formData.workType,
          workHours: formData.workHours,
          availability: formData.availability,
          travelWillingness: formData.travelWillingness,
          preferredTimeZones: formData.preferredTimeZones,
          serviceModes: formData.serviceModes,
        };
      case 8:
        return {
          acceptTerms: formData.acceptTerms,
          consentMarketing: formData.consentMarketing,
        };
      default:
        return {};
    }
  };

  const handleSubmit = useCallback(
    async (e, isDraft = false) => {
      e.preventDefault();
      setIsSubmitting(true);
      setServerMessage({ type: "", message: "" });
      console.log('Submitting form, isDraft:', isDraft);

      if (!isDraft) {
        const requiredFields = [
          "fullName", "dob", "contactNumber", "email", "address", "pinCode",
          "city", "state", "institution", "education", "fieldOfStudy", "experience", "acceptTerms"
        ];
        const newErrors = {};

        requiredFields.forEach((field) => {
          if (!formData[field] || formData[field].toString().trim() === "") {
            newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
          }
        });

        if (formData.dob && !/^\d{4}-\d{2}-\d{2}$/.test(formData.dob)) {
          newErrors.dob = "Date of birth must be in YYYY-MM-DD format (e.g., 1990-01-01)";
        }
        if (formData.contactNumber && !/^\d{10}$/.test(formData.contactNumber)) {
          newErrors.contactNumber = "Contact number must be exactly 10 digits";
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "Invalid email format";
        }
        if (!["Male", "Female", "Other", "Prefer not to say"].includes(formData.gender)) {
          newErrors.gender = "Invalid gender selection";
        }
        if (!formData.acceptTerms) {
          newErrors.acceptTerms = "You must accept the terms and conditions";
        }
        if (formData.pinCode && !/^\d{6}$/.test(formData.pinCode)) {
          newErrors.pinCode = "Pin code must be exactly 6 digits";
        }

        if (Object.keys(newErrors).length > 0) {
          console.log('Validation errors:', newErrors);
          setErrors(newErrors);
          setServerMessage({ type: "error", message: "Please fix the errors before submitting" });
          setIsSubmitting(false);
          return;
        }

        const fileFormData = new FormData();
        for (const [key, value] of Object.entries(formData)) {
          if (Array.isArray(value)) {
            fileFormData.append(key, JSON.stringify(value));
          } else if (value instanceof File) {
            fileFormData.append(key, value);
          } else {
            fileFormData.append(key, value);
          }
        }
        workSamples.forEach((file) => fileFormData.append("workSamples", file));

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/gis-registration/submit`, {
            method: "POST",
            body: fileFormData,
            credentials: "include",
          });

          console.log('Submission response:', response.status);
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Submission error:', errorData);
            setServerMessage({
              type: "error",
              message: `Submission failed: ${errorData.message}`,
              errors: errorData.errors || [],
            });
            setErrors(
              errorData.errors?.reduce((acc, err) => ({ ...acc, [err.field]: err.message }), {}) || {}
            );
            setIsSubmitting(false);
            if (response.status === 401) {
              router.push("/account/login");
            }
            throw new Error(errorData.message);
          }

          const data = await response.json();
          console.log('Submission successful:', data);
          setServerMessage({
            type: "success",
            message: "Registration successful! Redirecting...",
          });
          setTimeout(() => {
            setFormData(createInitialFormData());
            router.push("/gis/dashboard");
          }, 1500);
        } catch (error) {
          console.error('Submission error:', error);
          setServerMessage({
            type: "error",
            message: `Submission failed: ${error.message}`
          });
          setIsSubmitting(false);
        }
      } else {
        const tabData = getTabData(activeTab, formData);
        const fileFormData = new FormData();
        fileFormData.append("tabNumber", activeTab);
        fileFormData.append("isDraft", "true");

        for (const [key, value] of Object.entries(tabData)) {
          if (key === "profileImage" && value instanceof File) {
            fileFormData.append("profileImage", value);
          } else if (key === "certificationFile" && value instanceof File) {
            fileFormData.append("certificationFile", value);
          } else if (key === "workSamples") {
            workSamples.forEach((file) => fileFormData.append("workSamples", file));
          } else if (Array.isArray(value)) {
            fileFormData.append(key, JSON.stringify(value));
          } else {
            fileFormData.append(key, value);
          }
        }

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/gis-registration/draft`, {
            method: "PUT",
            body: fileFormData,
            credentials: "include",
          });

          console.log('Draft save response:', response.status);
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Draft save error:', errorData);
            setServerMessage({
              type: "error",
              message: `Failed to save draft: ${errorData.message}`
            });
            setIsSubmitting(false);
            if (response.status === 401) {
              router.push("/account/login");
            }
            throw new Error(errorData.message || "Failed to save draft");
          }

          const data = await response.json();
          console.log('Draft saved:', data);
          setSavedTabs((prev) => [...new Set([...prev, activeTab])]);
          setDisabledTabs((prev) => [...new Set([...prev, activeTab])]);
          setServerMessage({ type: "success", message: `Tab ${activeTab} saved successfully!` });
        } catch (err) {
          console.error('Draft save error:', err);
          setServerMessage({ type: "error", message: `Error: ${err.message}` });
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [formData, activeTab, workSamples, router, userData]
  );

  const handleStartNewForm = useCallback(async () => {
    if (!confirm("Are you sure you want to start a new form? Your draft will be deleted."))
      return;
    try {
      console.log('Deleting draft...');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/gis-registration/draft`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      console.log('Draft delete response:', response.status);
      if (response.ok) {
        console.log('Draft deleted successfully');
        setFormData(createInitialFormData());
        setActiveTab(1);
        setSavedTabs([]);
        setDisabledTabs([]);
        setHasDraft(false);
        setWorkSamples([]);
        setServerMessage({
          type: "success",
          message: "Draft deleted successfully",
        });
      } else {
        const errorData = await response.json();
        console.error('Draft delete error:', errorData);
        setServerMessage({
          type: "error",
          message: `Failed to delete draft: ${errorData.message}`
        });
        if (response.status === 401) {
          router.push("/account/login");
        }
      }
    } catch (error) {
      console.error("Error deleting draft:", error);
      setServerMessage({ type: "error", message: "Failed to delete draft: " + error.message });
    }
  }, [router]);

  const handleTabChange = useCallback((tabNumber) => {
    console.log('Changing to tab:', tabNumber);
    setVisitedTabs((prev) => new Set([...prev, tabNumber]));
    setActiveTab(tabNumber);
    if (tabRefs.current[tabNumber - 1]) {
      tabRefs.current[tabNumber - 1].focus();
    }
  }, []);

  const validateForm = useCallback(
    (tab) => {
      const newErrors = {};
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\d{10}$/;
      const pincodeRegex = /^\d{6}$/;

      const requiredFields = {
        1: ["fullName", "email", "contactNumber", "dob", "address", "pinCode"],
        2: ["institution", "fieldOfStudy"],
        5: formData.projects.map((_, i) => `projectTitle${i}`),
        8: ["acceptTerms"],
      };

      requiredFields[tab]?.forEach((field) => {
        if (field.startsWith("projectTitle")) {
          const index = parseInt(field.replace("projectTitle", ""));
          if (!formData.projects[index]?.title?.trim()) {
            newErrors[field] = `Project ${index + 1} title is required`;
          }
        } else if (!formData[field]?.toString().trim()) {
          newErrors[field] = `${
            field.charAt(0).toUpperCase() +
            field.slice(1).replace(/([A-Z])/g, " $1")
          } is required`;
        }
      });

      if (tab === 1) {
        if (formData.email && !emailRegex.test(formData.email))
          newErrors.email = "Valid email is required";
        if (formData.contactNumber && !phoneRegex.test(formData.contactNumber))
          newErrors.contactNumber = "Valid 10-digit phone number is required";
        if (formData.pinCode && !pincodeRegex.test(formData.pinCode))
          newErrors.pinCode = "Valid 6-digit pin code is required";
      }

      setErrors(newErrors);
      console.log('Validation errors:', newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [formData]
  );

  const handleNext = useCallback(() => {
    if (validateForm(activeTab)) {
      console.log('Moving to next tab:', activeTab + 1);
      setActiveTab((prev) => Math.min(prev + 1, 8));
      setVisitedTabs((prev) => new Set([...prev, activeTab + 1]));
    } else {
      setServerMessage({
        type: "error",
        message: "Please fix the errors before proceeding",
      });
    }
  }, [activeTab, validateForm]);

  const handlePrev = useCallback(() => {
    if (activeTab > 1) {
      console.log('Moving to previous tab:', activeTab - 1);
      setActiveTab(activeTab - 1);
    }
  }, [activeTab]);

  if (!isMounted) {
    return null;
  }

  if (isLoading || isFetching) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (hasDraft) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Continue Your Registration
          </h2>
          {serverMessage.message && (
            <div className={`mb-4 p-3 rounded flex justify-between items-center ${
              serverMessage.type === "error"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}>
              <span className="text-sm">{serverMessage.message}</span>
              <button
                onClick={() => setServerMessage({ type: "", message: "" })}
                className="text-sm ml-2"
              >
                ✕
              </button>
            </div>
          )}
          <p className="mb-6 text-gray-600 text-center">
            We found an incomplete registration draft. Would you like to continue?
          </p>
          <div className="space-y-4">
            <button
              onClick={() => {
                setHasDraft(false);
              }}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Continue Draft
            </button>
            <button
              onClick={() => {
                setHasDraft(false);
                setDisabledTabs([]);
              }}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-200"
            >
              Edit Draft
            </button>
            <button
              onClick={handleStartNewForm}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-200"
            >
              Start New Registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="sticky top-0 z-10 bg-white shadow-md rounded-lg p-2 mb-4">
          <div className="flex overflow-x-auto">
            {[
              "Personal Info",
              "Education",
              "Technical Skills",
              "Professional Info",
              "Projects",
              "Equipment",
              "Availability",
              "Terms",
            ].map((tab, index) => (
              <button
                key={index}
                onClick={() => handleTabChange(index + 1)}
                className={`flex-1 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  activeTab === index + 1
                    ? "bg-blue-100 text-blue-600 border-b-2 border-blue-500"
                    : visitedTabs.has(index + 1)
                    ? "text-blue-500 hover:bg-blue-50"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {tab}{" "}
                {savedTabs.includes(index + 1) && (
                  <span className="ml-1 text-green-500">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {serverMessage.message && (
          <div
            className={`p-4 rounded-lg flex justify-between items-center shadow-md ${
              serverMessage.type === "error"
                ? "bg-red-50 border-l-4 border-red-500 text-red-700"
                : "bg-green-50 border-l-4 border-green-500 text-green-700"
            }`}
          >
            <p>{serverMessage.message}</p>
            <button
              onClick={() => setServerMessage({ type: "", message: "" })}
              className="text-sm"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          {activeTab === 1 && (
            <PersonalInfoTab
              formData={formData}
              handleChange={handleChange}
              handleImageUpload={handleImageUpload}
              errors={errors}
              savedTabs={savedTabs}
              tabRefs={tabRefs}
              setFormData={setFormData}
              isDraftMode={disabledTabs.includes(1)}
            />
          )}
          {activeTab === 2 && (
            <EducationTab
              formData={formData}
              handleChange={handleChange}
              errors={errors}
              savedTabs={savedTabs}
              isDraftMode={disabledTabs.includes(2)}
              tabRefs={tabRefs}
            />
          )}
          {activeTab === 3 && (
            <TechnicalSkillsTab
              formData={formData}
              handleChange={handleChange}
              handleArrayChange={handleArrayChange}
              errors={errors}
              savedTabs={savedTabs}
              isDraftMode={disabledTabs.includes(3)}
              tabRefs={tabRefs}
            />
          )}
          {activeTab === 4 && (
            <ProfessionalInfoTab
              formData={formData}
              handleChange={handleChange}
              errors={errors}
              savedTabs={savedTabs}
              isDraftMode={disabledTabs.includes(4)}
              tabRefs={tabRefs}
            />
          )}
          {activeTab === 5 && (
            <ProjectsTab
              formData={formData}
              handleProjectChange={handleProjectChange}
              addProject={addProject}
              handleWorkSampleUpload={handleWorkSampleUpload}
              workSamples={workSamples}
              setWorkSamples={setWorkSamples}
              errors={errors}
              savedTabs={savedTabs}
              isDraftMode={disabledTabs.includes(5)}
              tabRefs={tabRefs}
            />
          )}
          {activeTab === 6 && (
            <EquipmentTab
              formData={formData}
              handleChange={handleChange}
              handleArrayChange={handleArrayChange}
              errors={errors}
              savedTabs={savedTabs}
              isDraftMode={disabledTabs.includes(6)}
              tabRefs={tabRefs}
            />
          )}
          {activeTab === 7 && (
            <AvailabilityTab
              formData={formData}
              handleChange={handleChange}
              handleArrayChange={handleArrayChange}
              errors={errors}
              savedTabs={savedTabs}
              isDraftMode={disabledTabs.includes(7)}
              tabRefs={tabRefs}
            />
          )}
          {activeTab === 8 && (
            <TermsTab
              formData={formData}
              handleChange={handleChange}
              errors={errors}
              savedTabs={savedTabs}
              isSubmitting={isSubmitting}
              setActiveTab={setActiveTab}
              isDraftMode={disabledTabs.includes(8)}
              tabRefs={tabRefs}
              setIsDraftMode={() => setDisabledTabs([])}
            />
          )}

          {activeTab !== 8 && (
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={handlePrev}
                disabled={activeTab === 1 || isSubmitting}
                className={`px-4 py-2 rounded-lg transition duration-200 ${
                  activeTab === 1
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                Previous
              </button>
              <div className="flex gap-4">
                {disabledTabs.includes(activeTab) ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDisabledTabs(disabledTabs.filter(tab => tab !== activeTab));
                    }}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-200"
                  >
                    Edit This Tab
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200 disabled:bg-gray-400"
                  >
                    {isSubmitting ? "Saving..." : `Save Tab ${activeTab} Draft`}
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-blue-300"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}