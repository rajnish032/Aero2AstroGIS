import { checkSchema, validationResult } from "express-validator";
import { validateRequest } from "./validationMiddleware.js";

// Helper function to parse array fields (defined locally)
const parseArrayField = (value) => {
  if (!value) return undefined;
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : value.split(",").map((item) => item.trim());
    } catch (error) {
      return value.split(",").map((item) => item.trim());
    }
  }
  return [value];
};

const draftGISRegistrationSchema = {
  tabNumber: {
    notEmpty: true,
    errorMessage: "Tab number is required",
    isInt: { options: { min: 1, max: 8 }, errorMessage: "Tab number must be between 1 and 8" },
  },
  // Personal Info (Tab 1)
  fullName: {
    optional: true,
    trim: true,
    isLength: { options: { max: 100 }, errorMessage: "Full name must be less than 100 characters" },
  },
  dob: {
    optional: true,
    isISO8601: { errorMessage: "Invalid date format (YYYY-MM-DD)" },
    custom: {
      options: (value) => {
        if (!value) return true;
        const birthDate = new Date(value);
        const minDate = new Date("1900-01-01");
        const maxDate = new Date();
        if (birthDate < minDate) throw new Error("Date of birth cannot be before 1900");
        if (birthDate > maxDate) throw new Error("Date of birth cannot be in the future");
        return true;
      },
    },
  },
  gender: {
    optional: true,
    isIn: { options: [["Male", "Female", "Other", "Prefer not to say"]], errorMessage: "Invalid gender selection" },
  },
  contactNumber: {
    optional: true,
    matches: { options: /^\d{10}$/, errorMessage: "Contact number must be 10 digits" },
  },
  email: {
    optional: true,
    isEmail: { errorMessage: "Invalid email format" },
    normalizeEmail: true,
  },
  nationality: {
    optional: true,
    trim: true,
  },
  address: {
    optional: true,
    isLength: { options: { max: 200 }, errorMessage: "Address must be less than 200 characters" },
  },
  pinCode: {
    optional: true,
    matches: { options: /^\d{6}$/, errorMessage: "Pin code must be 6 digits" },
  },
  city: {
    optional: true,
    trim: true,
  },
  state: {
    optional: true,
    trim: true,
  },
  // Education (Tab 2)
  institution: {
    optional: true,
    isLength: { options: { max: 100 }, errorMessage: "Institution must be less than 100 characters" },
  },
  education: {
    optional: true,
    trim: true,
  },
  certifications: {
    optional: true,
    custom: {
      options: (value) => {
        if (!value) return true;
        const parsed = parseArrayField(value);
        return Array.isArray(parsed);
      },
      errorMessage: "Certifications must be an array or comma-separated string",
    },
  },
  fieldOfStudy: {
    optional: true,
    trim: true,
  },
  year: {
    optional: true,
    isInt: { options: { min: 1900, max: new Date().getFullYear() + 5 }, errorMessage: "Invalid year" },
  },
  // Skills (Tab 3)
  gisSoftware: {
    optional: true,
    custom: {
      options: (value) => !value || Array.isArray(parseArrayField(value)),
      errorMessage: "GIS software must be an array or comma-separated string",
    },
  },
  // Professional Info (Tab 4)
  experience: {
    optional: true,
    trim: true,
  },
  // Projects (Tab 5)
  projects: {
    optional: true,
    custom: {
      options: (value) => {
        if (!value) return true;
        const parsed = parseArrayField(value);
        if (!Array.isArray(parsed)) return false;
        // Optionally enforce object structure
        return parsed.every((item) =>
          typeof item === "object" ? item.title && typeof item.title === "string" : typeof item === "string"
        );
      },
      errorMessage: "Projects must be an array of objects with titles or a comma-separated string",
    },
  },
  "projects.*.title": {
    optional: true,
    isLength: { options: { max: 100 }, errorMessage: "Project title must be less than 100 characters" },
  },
  "projects.*.description": {
    optional: true,
    isLength: { options: { max: 1000 }, errorMessage: "Project description must be less than 1000 characters" },
  },
  "projects.*.technologies": {
    optional: true,
    trim: true,
  },
  // Equipment (Tab 6)
  availableEquipment: {
    optional: true,
    custom: {
      options: (value) => !value || Array.isArray(parseArrayField(value)),
      errorMessage: "Available equipment must be an array or comma-separated string",
    },
  },
  // Work Preferences (Tab 7)
  serviceModes: {
    optional: true,
    custom: {
      options: (value) => !value || Array.isArray(parseArrayField(value)),
      errorMessage: "Service modes must be an array or comma-separated string",
    },
  },
  // Terms (Tab 8)
  acceptTerms: {
    optional: true,
    custom: { options: (value) => value === true || value === "true", errorMessage: "Accept terms must be true" },
  },
};

// Ensure draft isn’t completely empty and tab-specific rules
const validateNonEmptyDraft = (req, res, next) => {
  const tabNumber = parseInt(req.body.tabNumber);
  const hasBodyData = Object.keys(req.body).some(
    (key) => key !== "tabNumber" && req.body[key] !== undefined && req.body[key] !== "" && req.body[key] !== null
  );
  const hasFiles = req.files && Object.keys(req.files).length > 0;

  if (!hasBodyData && !hasFiles) {
    return res.status(400).json({
      success: false,
      message: "Cannot save an empty draft",
      errorCode: "EMPTY_DRAFT_ERROR",
    });
  }

  const errors = [];
  if (req.files) {
    const { profileImage, workSamples, certificationFile } = req.files;
    if (tabNumber !== 1 && profileImage) {
      errors.push({ field: "profileImage", message: "Profile image is only allowed in Tab 1" });
    }
    if (tabNumber !== 5 && workSamples) {
      errors.push({ field: "workSamples", message: "Work samples are only allowed in Tab 5" });
    }
    if (tabNumber !== 6 && certificationFile) {
      errors.push({ field: "certificationFile", message: "Certification file is only allowed in Tab 6" });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Draft validation failed",
      errors,
      errorCode: "DRAFT_VALIDATION_ERROR",
    });
  }
  next();
};

// Combine draft validations
export const validateDraftGISRegistration = [
  checkSchema(draftGISRegistrationSchema),
  validateNonEmptyDraft,
  validateRequest,
];

// Validate file uploads for drafts
export const validateDraftFileUploads = (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) return next();

  const errors = [];
  const { profileImage, workSamples, certificationFile } = req.files;

  if (profileImage?.[0]) {
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(profileImage[0].mimetype)) {
      errors.push({ field: "profileImage", message: "Profile image must be JPEG or PNG" });
    }
    if (profileImage[0].size > 3 * 1024 * 1024) {
      errors.push({ field: "profileImage", message: "Profile image must be less than 3MB" });
    }
  }

  if (workSamples?.length > 0) {
    if (workSamples.length > 5) {
      errors.push({ field: "workSamples", message: "Maximum 5 work samples allowed" });
    }
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    workSamples.forEach((file, i) => {
      if (!allowedTypes.includes(file.mimetype)) {
        errors.push({ field: `workSamples[${i}]`, message: "Work sample must be PDF, JPEG, PNG, or Word" });
      }
      if (file.size > 10 * 1024 * 1024) {
        errors.push({ field: `workSamples[${i}]`, message: "Work sample must be less than 10MB" });
      }
    });
  }

  if (certificationFile?.[0]) {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(certificationFile[0].mimetype)) {
      errors.push({ field: "certificationFile", message: "Certification file must be PDF, JPEG, or PNG" });
    }
    if (certificationFile[0].size > 10 * 1024 * 1024) {
      errors.push({ field: "certificationFile", message: "Certification file must be less than 10MB" });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Draft file validation failed",
      errors,
      errorCode: "DRAFT_FILE_VALIDATION_ERROR",
    });
  }
  next();
};