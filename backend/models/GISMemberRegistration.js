import mongoose from "mongoose";

const GISMemberSchema = new mongoose.Schema(
  {
    isDraft: { 
      type: Boolean, 
      default: true 
    },
    lastSavedTab: { 
      type: Number, 
      default: 1 
    },
    savedTabs: [{ 
      type: Number 
    }],
    submittedAt: { 
      type: Date 
    },
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      unique: true // Kept unique, assuming one draft/registration per user
    },
    //apply for approval
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "review", "approved", "rejected"], // Matches applyApproval
    },

    // Personal Info (Tab 1)
    fullName: { type: String, trim: true }, // Required only on final submission
    dob: { type: Date },
    gender: { 
      type: String, 
      enum: ["Male", "Female", "Other", "Prefer not to say"] 
    },
    contactNumber: {
      type: String,
      match: [/^\d{10}$/, "Invalid contact number (must be 10 digits)"],
      trim: true,
    },
    email: { 
      type: String,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
      trim: true,
    },
    nationality: { type: String, trim: true },
    profileImage: { type: String, default: null }, // Stores file path or URL
    address: { type: String, trim: true },
    pinCode: {
      type: String,
      match: [/^\d{6}$/, "Invalid pin code (must be 6 digits)"],
      trim: true,
    },
    city: { type: String, trim: true },
    state: { type: String, trim: true },

    // Education (Tab 2)
    institution: { type: String, trim: true },
    education: { type: String, trim: true },
    certifications: [{ type: String, trim: true }],
    fieldOfStudy: { type: String, trim: true },
    year: { 
      type: String, 
      match: [/^(19|20)\d{2}$/, "Year must be between 1900 and 2099"],
      trim: true,
    },

    // Technical Skills (Tab 3)
    gisSoftware: [{ type: String, trim: true }],
    gisSoftwareOther: { type: String, trim: true },
    programmingSkills: [{ type: String, trim: true }],
    programmingSkillsOther: { type: String, trim: true },
    CoreExpertise: [{ type: String, trim: true }],
    CoreExpertiseOther: { type: String, trim: true },
    droneDataProcessing: { 
      type: String,
      enum: ["None", "Beginner", "Intermediate", "Advanced"],
      default: "None"
    },
    photogrammetrySoftware: [{ type: String, trim: true }],
    photogrammetrySoftwareOther: { type: String, trim: true },
    remoteSensing: { 
      type: String,
      enum: ["None", "Beginner", "Intermediate", "Advanced"],
      default: "None"
    },
    lidarProcessing: { 
      type: String,
      enum: ["None", "Beginner", "Intermediate", "Advanced"],
      default: "None"
    },

    // Professional Info (Tab 4)
    experience: { type: String, trim: true },
    organization: { type: String, trim: true },
    employer: { 
      type: String,
      enum: ["Full-time", "Part-time", "Freelancer", "Student", "Unemployed", "Other"],
      default: "Unemployed"
    },
    linkedIn: {
      type: String,
      match: [/^https?:\/\/(www\.)?linkedin\.com\/.*$/, "Invalid LinkedIn URL"],
      trim: true,
    },
    portfolio: {
      type: String,
      match: [/^https?:\/\/.*$/, "Invalid Portfolio URL"],
      trim: true,
    },
    jobTitle: { type: String, trim: true },
    skills: [{ type: String, trim: true }],

    // Work Preferences (Tab 7)
    workMode: { 
      type: String, 
      enum: ["Remote", "On-site", "Hybrid"],
      default: "Remote"
    },
    workType: { 
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Freelance"],
      default: "Full-time"
    },
    workHours: { type: String, trim: true },
    availability: { 
      type: String,
      enum: [
        "Full-time",
        "Immediately Available",
        "Available in 1-2 weeks",
        "Available in 1 month",
        "Not currently available"
      ],
      default: "Full-time"
    },
    travelWillingness: { 
      type: String,
      enum: ["Yes", "No", "Limited"],
      default: "Yes"
    },
    preferredTimeZones: { type: String, trim: true },
    serviceModes: [{ 
      type: String,
      enum: ["Online", "On-site", "Hybrid", "Consultation"]
    }],

    // Projects (Tab 5)
    projects: [
      {
        title: { type: String, trim: true },
        description: { type: String, trim: true },
        technologies: { type: String, trim: true }
      }
    ],

    // Equipment (Tab 6)
    ownEquipment: { 
      type: String,
      enum: ["Yes", "No"],
      default: "No"
    },
    availableEquipment: [{ 
      type: String,
      enum: [
        "GPS Receiver",
        "Total Station",
        "Drone/UAV",
        "3D Scanner",
        "Survey Grade Tablet",
        "Laser Distance Meter",
        "Other"
      ]
    }],
    equipmentName: { type: String, trim: true },
    equipmentBrand: { type: String, trim: true },
    equipmentYear: { type: String, trim: true },
    equipmentSpecs: { type: String, trim: true },
    maintenanceSchedule: { type: String, trim: true },
    droneCertification: { 
      type: String,
      enum: ["Yes", "No"],
      default: "No"
    },
    certificationFile: { type: String, default: null }, // Stores file path or URL
    equipmentRental: { 
      type: String,
      enum: ["Yes", "No"],
      default: "No"
    },
    rentalTerms: { type: String, trim: true },

    // Work Samples (Tab 5)
    workSamples: [{ type: String }], // Array of file paths or URLs
    videoShowcase: { type: String, trim: true },

    // Terms (Tab 8)
    acceptTerms: { 
      type: Boolean,
      default: false
    },
    consentMarketing: { 
      type: Boolean, 
      default: false 
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Custom validation for final submission (not drafts)
GISMemberSchema.pre("save", function (next) {
  if (!this.isDraft) {
    const requiredFields = [
      "fullName", "dob", "gender", "contactNumber", "email", "nationality",
      "address", "pinCode", "city", "state", "institution", "education",
      "fieldOfStudy", "experience", "acceptTerms"
    ];
    const missingFields = requiredFields.filter(field => !this[field]);
    if (missingFields.length > 0) {
      return next(new Error(`Missing required fields for final submission: ${missingFields.join(", ")}`));
    }
    if (!this.projects || this.projects.length < 3) {
      return next(new Error("At least 3 projects are required for final submission"));
    }
    if (this.acceptTerms !== true) {
      return next(new Error("You must accept the terms and conditions for final submission"));
    }
  }
  next();
});

// Virtual for profile completion
GISMemberSchema.virtual("profileCompletion").get(function () {
  const requiredFields = [
    this.fullName, this.dob, this.gender, this.contactNumber, this.email,
    this.nationality, this.address, this.pinCode, this.city, this.state,
    this.institution, this.education, this.fieldOfStudy, this.experience,
    this.acceptTerms
  ];
  const filled = requiredFields.filter(Boolean).length;
  return Math.round((filled / requiredFields.length) * 100);
});

// Indexes for better query performance
GISMemberSchema.index({ user: 1 });
GISMemberSchema.index({ email: 1 });
GISMemberSchema.index({ skills: 1 });
GISMemberSchema.index({ gisSoftware: 1 });
GISMemberSchema.index({ CoreExpertise: 1 });

const GISMember = mongoose.model("GISMember", GISMemberSchema);
export default GISMember;