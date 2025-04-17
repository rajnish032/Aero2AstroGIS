import { body, checkSchema, validationResult } from "express-validator";

// Helper function to parse array fields
const parseArrayField = (value) => {
  if (!value) return undefined;
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : value.split(",").map((item) => item.trim());
    } catch (error) {
      console.log(`Failed to parse ${value} as JSON, splitting by comma:`, error.message);
      return value.split(",").map((item) => item.trim());
    }
  }
  return [value];
};

// Enhanced validation error formatter
const formatValidationError = (errors) => {
  return errors.array().map((err) => ({
    field: err.path,
    message: err.msg,
    value: err.value,
  }));
};

// Middleware to handle validation errors
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = formatValidationError(errors);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
      errorCode: "VALIDATION_ERROR",
    });
  }
  next();
};

// Schema-based validation for full submission
const gisRegistrationSchema = {
  // Personal Info (Tab 1)
  fullName: {
    notEmpty: true,
    errorMessage: "Full name is required",
    trim: true,
    isLength: { options: { max: 100 }, errorMessage: "Full name must be less than 100 characters" },
  },
  dob: {
    notEmpty: true,
    errorMessage: "Date of birth is required",
    isISO8601: { errorMessage: "Invalid date format (YYYY-MM-DD)" },
    custom: {
      options: (value) => {
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
    notEmpty: true,
    errorMessage: "Gender is required",
    isIn: { options: [["Male", "Female", "Other", "Prefer not to say"]], errorMessage: "Invalid gender selection" },
  },
  contactNumber: {
    notEmpty: true,
    errorMessage: "Contact number is required",
    matches: { options: /^\d{10}$/, errorMessage: "Contact number must be 10 digits" },
  },
  email: {
    notEmpty: true,
    errorMessage: "Email is required",
    isEmail: { errorMessage: "Invalid email format" },
    normalizeEmail: true,
  },
  nationality: {
    notEmpty: true,
    errorMessage: "Nationality is required",
    trim: true,
  },
  address: {
    notEmpty: true,
    errorMessage: "Address is required",
    trim: true,
    isLength: { options: { max: 200 }, errorMessage: "Address must be less than 200 characters" },
  },
  pinCode: {
    notEmpty: true,
    errorMessage: "Pin code is required",
    matches: { options: /^\d{6}$/, errorMessage: "Pin code must be 6 digits" },
  },
  city: {
    notEmpty: true,
    errorMessage: "City is required",
    trim: true,
  },
  state: {
    notEmpty: true,
    errorMessage: "State is required",
    trim: true,
  },

  // Education (Tab 2)
  institution: {
    notEmpty: true,
    errorMessage: "Institution is required",
    trim: true,
    isLength: { options: { max: 100 }, errorMessage: "Institution must be less than 100 characters" },
  },
  education: {
    notEmpty: true,
    errorMessage: "Education is required",
    trim: true,
  },
  certifications: {
    notEmpty: true,
    errorMessage: "Certifications are required",
    custom: {
      options: (value) => {
        const parsed = parseArrayField(value);
        return Array.isArray(parsed) && parsed.length > 0;
      },
      errorMessage: "Certifications must be a non-empty array or comma-separated string",
    },
  },
  fieldOfStudy: {
    notEmpty: true,
    errorMessage: "Field of study is required",
    trim: true,
  },
  year: {
    optional: true, // Optional for submission
    isInt: { options: { min: 1900, max: new Date().getFullYear() + 5 }, errorMessage: "Invalid year" },
  },

  // Skills (Tab 3)
  gisSoftware: {
    notEmpty: true,
    errorMessage: "GIS software is required",
    custom: {
      options: (value) => {
        const parsed = parseArrayField(value);
        return Array.isArray(parsed) && parsed.length > 0;
      },
      errorMessage: "GIS software must be a non-empty array or comma-separated string",
    },
  },

  // Professional Info (Tab 4)
  experience: {
    notEmpty: true,
    errorMessage: "Experience is required",
    trim: true,
  },

  // Projects (Tab 5)
  projects: {
    notEmpty: true,
    errorMessage: "Projects are required",
    custom: {
      options: (value) => {
        const parsed = parseArrayField(value);
        if (!Array.isArray(parsed) || parsed.length < 1) { // Reduced to 1 for testing; adjust as needed
          throw new Error("At least 1 project is required");
        }
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

  // Work Preferences (Tab 7)
  serviceModes: {
    notEmpty: true,
    errorMessage: "Service modes are required",
    custom: {
      options: (value) => {
        const parsed = parseArrayField(value);
        return Array.isArray(parsed) && parsed.length > 0;
      },
      errorMessage: "Service modes must be a non-empty array or comma-separated string",
    },
  },

  // Terms (Tab 8)
  acceptTerms: {
    custom: {
      options: (value) => value === true || value === "true",
      errorMessage: "You must accept the terms and conditions",
    },
  },
};

export const validateGISRegistration = checkSchema(gisRegistrationSchema);

// File upload validation for submission
export const validateFileUploads = (req, res, next) => {
  if (!req.files) return next();

  const errors = [];
  const { profileImage, workSamples, certificationFile } = req.files;

  if (profileImage) {
    const allowedImageTypes = ["image/jpeg", "image/png"];
    if (!allowedImageTypes.includes(profileImage[0].mimetype)) {
      errors.push({ field: "profileImage", message: "Profile image must be JPEG or PNG" });
    }
    if (profileImage[0].size > 3 * 1024 * 1024) {
      errors.push({ field: "profileImage", message: "Profile image must be less than 3MB" });
    }
  }

  if (workSamples) {
    if (workSamples.length > 5) {
      errors.push({ field: "workSamples", message: "Maximum 5 work samples allowed" });
    }
    const allowedFileTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    workSamples.forEach((file, index) => {
      if (!allowedFileTypes.includes(file.mimetype)) {
        errors.push({ field: `workSamples[${index}]`, message: "Invalid file type for work sample" });
      }
      if (file.size > 5 * 1024 * 1024) {
        errors.push({ field: `workSamples[${index}]`, message: "Work sample must be less than 5MB" });
      }
    });
  }

  if (certificationFile) {
    const allowedCertTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedCertTypes.includes(certificationFile[0].mimetype)) {
      errors.push({ field: "certificationFile", message: "Certification must be PDF, JPEG, or PNG" });
    }
    if (certificationFile[0].size > 5 * 1024 * 1024) {
      errors.push({ field: "certificationFile", message: "Certification file must be less than 5MB" });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "File validation failed",
      errors,
      errorCode: "FILE_VALIDATION_ERROR",
    });
  }
  next();
};