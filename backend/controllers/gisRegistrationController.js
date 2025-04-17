import mongoose from "mongoose";
import fs from "fs/promises";
import GISMember from "../models/GISMemberRegistration.js";
import UserModel from "../models/User.js";

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

export const registerGISMember = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const userId = req.user?._id;
    if (!userId) throw new Error("Unauthorized: Please log in first");

    console.log("Files in registerGISMember:", req.files);
    console.log("Body in registerGISMember:", req.body);

    const projects = parseArrayField(req.body.projects);
    const serviceModes = parseArrayField(req.body.serviceModes);
    const availableEquipment = Object.keys(req.body)
      .filter((key) => key.startsWith("availableEquipment["))
      .map((key) => req.body[key].trim())
      .filter(Boolean);

    const filePaths = {
      profileImage: req.files?.profileImage?.[0]?.path ? `uploads/${req.files.profileImage[0].filename}` : null,
      workSamples: req.files?.workSamples?.map((f) => `uploads/${f.filename}`) || [],
      certificationFile: req.files?.certificationFile?.[0]?.path ? `uploads/${req.files.certificationFile[0].filename}` : null,
    };

    const existing = await GISMember.findOne({ user: userId, isDraft: false }).session(session);
    if (existing) throw new Error("GIS Registration already completed");

    const memberData = {
      ...req.body,
      dob: req.body.dob ? new Date(req.body.dob) : undefined,
      projects: projects?.map((p) => (typeof p === "string" ? { title: p, description: "", technologies: "" } : p)),
      serviceModes,
      availableEquipment,
      ...filePaths,
      isDraft: false,
      submittedAt: new Date(),
      user: userId,
    };
    ["_id", ...Object.keys(req.body).filter((k) => k.startsWith("availableEquipment["))].forEach((key) => delete memberData[key]);

    let newMember;
    const draft = await GISMember.findOne({ user: userId, isDraft: true }).session(session);
    if (draft) {
      newMember = await GISMember.findOneAndUpdate(
        { user: userId, isDraft: true },
        { $set: memberData },
        { new: true, session }
      );
    } else {
      newMember = await GISMember.create([memberData], { session });
      newMember = newMember[0];
    }

    await UserModel.findByIdAndUpdate(userId, { isGISRegistered: true }, { session });
    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: { memberId: newMember._id, redirectTo: "/user/profile" },
    });
  } catch (error) {
    await session.abortTransaction();
    if (req.files) {
      await Promise.all(
        Object.values(req.files)
          .flat()
          .map((file) => fs.unlink(file.path).catch((err) => console.error("File cleanup error:", err)))
      );
    }
    const status = { Unauthorized: 401, Validation: 400, already: 409 }[error.message.split(" ")[0]] || 500;
    res.status(status).json({
      success: false,
      message: error.message,
      ...(process.env.NODE_ENV === "development" && { error: error.stack }),
    });
  } finally {
    session.endSession();
  }
};

export const saveDraft = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const userId = req.user?._id;
    if (!userId) throw new Error("Unauthorized: Please log in first");

    console.log("Files in saveDraft:", req.files);
    console.log("Body in saveDraft:", req.body);

    const tabNumber = parseInt(req.body.tabNumber);

    const updateData = {};
    switch (tabNumber) {
      case 1:
        updateData.fullName = req.body.fullName;
        updateData.dob = req.body.dob ? new Date(req.body.dob) : undefined;
        updateData.gender = req.body.gender;
        updateData.contactNumber = req.body.contactNumber;
        updateData.email = req.body.email;
        updateData.nationality = req.body.nationality;
        updateData.address = req.body.address;
        updateData.pinCode = req.body.pinCode;
        updateData.city = req.body.city;
        updateData.state = req.body.state;
        if (req.files?.profileImage) updateData.profileImage = `uploads/${req.files.profileImage[0].filename}`;
        break;
      case 2:
        console.log("Raw certifications:", req.body.certifications);
        updateData.institution = req.body.institution;
        updateData.education = req.body.education;
        updateData.certifications = parseArrayField(req.body.certifications);
        updateData.fieldOfStudy = req.body.fieldOfStudy;
        updateData.year = req.body.year;
        console.log("Parsed certifications:", updateData.certifications);
        break;
      case 3:
        updateData.gisSoftware = parseArrayField(req.body.gisSoftware);
        updateData.gisSoftwareOther = req.body.gisSoftwareOther;
        updateData.programmingSkills = parseArrayField(req.body.programmingSkills);
        updateData.programmingSkillsOther = req.body.programmingSkillsOther;
        updateData.CoreExpertise = parseArrayField(req.body.CoreExpertise);
        updateData.CoreExpertiseOther = req.body.CoreExpertiseOther;
        updateData.droneDataProcessing = req.body.droneDataProcessing;
        updateData.photogrammetrySoftware = parseArrayField(req.body.photogrammetrySoftware);
        updateData.photogrammetrySoftwareOther = req.body.photogrammetrySoftwareOther;
        updateData.remoteSensing = req.body.remoteSensing;
        updateData.lidarProcessing = req.body.lidarProcessing;
        break;
      case 4:
        updateData.experience = req.body.experience;
        updateData.organization = req.body.organization;
        updateData.employer = req.body.employer;
        updateData.linkedIn = req.body.linkedIn;
        updateData.portfolio = req.body.portfolio;
        updateData.jobTitle = req.body.jobTitle;
        updateData.skills = parseArrayField(req.body.skills);
        break;
      case 5:
        console.log("Raw projects:", req.body.projects);
        const rawProjects = parseArrayField(req.body.projects);
        updateData.projects = rawProjects?.map((p) =>
          typeof p === "string" ? { title: p, description: "", technologies: "" } : p
        );
        console.log("Parsed projects:", updateData.projects);
        if (req.files?.workSamples) updateData.workSamples = req.files.workSamples.map((file) => `uploads/${file.filename}`);
        break;
      case 6:
        updateData.ownEquipment = req.body.ownEquipment;
        updateData.availableEquipment = parseArrayField(req.body.availableEquipment);
        updateData.equipmentName = req.body.equipmentName;
        updateData.equipmentBrand = req.body.equipmentBrand;
        updateData.equipmentYear = req.body.equipmentYear;
        updateData.equipmentSpecs = req.body.equipmentSpecs;
        updateData.maintenanceSchedule = req.body.maintenanceSchedule;
        updateData.droneCertification = req.body.droneCertification;
        if (req.files?.certificationFile) updateData.certificationFile = `uploads/${req.files.certificationFile[0].filename}`;
        break;
      case 7:
        updateData.workMode = req.body.workMode;
        updateData.workType = req.body.workType;
        updateData.workHours = req.body.workHours;
        updateData.availability = req.body.availability;
        updateData.travelWillingness = req.body.travelWillingness;
        updateData.preferredTimeZones = req.body.preferredTimeZones;
        updateData.serviceModes = parseArrayField(req.body.serviceModes);
        break;
      case 8:
        updateData.acceptTerms = req.body.acceptTerms === "true" || req.body.acceptTerms === true;
        updateData.consentMarketing = req.body.consentMarketing === "true" || req.body.consentMarketing === true;
        break;
      default:
        throw new Error("Invalid tab number");
    }

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    if (updateData.profileImage || updateData.certificationFile || updateData.workSamples) {
      const oldDraft = await GISMember.findOne({ user: userId, isDraft: true }).session(session);
      if (oldDraft) {
        if (updateData.profileImage && oldDraft.profileImage) {
          await fs.unlink(oldDraft.profileImage).catch((err) => console.error("Error deleting old profile image:", err));
        }
        if (updateData.certificationFile && oldDraft.certificationFile) {
          await fs.unlink(oldDraft.certificationFile).catch((err) => console.error("Error deleting old certification file:", err));
        }
        if (updateData.workSamples && oldDraft.workSamples?.length) {
          await Promise.all(
            oldDraft.workSamples.map((path) => fs.unlink(path).catch((err) => console.error("Error deleting old work sample:", err)))
          );
        }
      }
    }

    const draft = await GISMember.findOneAndUpdate(
      { user: userId, isDraft: true },
      {
        $set: updateData,
        $addToSet: { savedTabs: tabNumber },
        lastSavedTab: tabNumber,
      },
      {
        new: true,
        upsert: true,
        session,
        setDefaultsOnInsert: true,
        runValidators: false,
      }
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: `Draft for Tab ${tabNumber} saved successfully`,
      data: { draftId: draft._id, savedTabs: draft.savedTabs, lastSaved: draft.updatedAt },
    });
  } catch (error) {
    console.error("SaveDraft Error:", error.message, error.stack);
    await session.abortTransaction();
    if (req.files) {
      await Promise.all(
        Object.values(req.files)
          .flat()
          .map((file) => fs.unlink(file.path).catch((err) => console.error("File cleanup error:", err)))
      );
    }
    res.status(error.message.includes("Unauthorized") ? 401 : 500).json({
      success: false,
      message: error.message,
      ...(process.env.NODE_ENV === "development" && { error: error.stack }),
    });
  } finally {
    session.endSession();
  }
};

export const updateGISMemberData = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized: Please log in first" });

    const memberId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      throw new Error("Invalid member ID");
    }

    const existingMember = await GISMember.findOne({ _id: memberId, user: userId, isDraft: false }).session(session);
    if (!existingMember) {
      throw new Error("GIS Member not found or unauthorized to update");
    }

    const projects = parseArrayField(req.body.projects);
    const serviceModes = parseArrayField(req.body.serviceModes);
    const availableEquipment = Object.keys(req.body)
      .filter((key) => key.startsWith("availableEquipment["))
      .map((key) => req.body[key].trim())
      .filter(Boolean);

    const filePaths = {
      profileImage: req.files?.profileImage?.[0]?.path ? `uploads/${req.files.profileImage[0].filename}` : existingMember.profileImage,
      workSamples: req.files?.workSamples?.map((f) => `uploads/${f.filename}`) || existingMember.workSamples || [],
      certificationFile: req.files?.certificationFile?.[0]?.path ? `uploads/${req.files.certificationFile[0].filename}` : existingMember.certificationFile,
    };

    const updateData = {
      ...req.body,
      dob: req.body.dob ? new Date(req.body.dob) : existingMember.dob,
      projects: projects?.map((p) => (typeof p === "string" ? { title: p, description: "", technologies: "" } : p)) || existingMember.projects,
      serviceModes: serviceModes || existingMember.serviceModes,
      availableEquipment: availableEquipment || existingMember.availableEquipment,
      ...filePaths,
      updatedAt: new Date(),
    };
    if (req.files) {
      if (req.files.profileImage && existingMember.profileImage) {
        await fs.unlink(existingMember.profileImage).catch((err) => console.error("Error deleting old profile image:", err));
      }
      if (req.files.certificationFile && existingMember.certificationFile) {
        await fs.unlink(existingMember.certificationFile).catch((err) => console.error("Error deleting old certification file:", err));
      }
      if (req.files.workSamples && existingMember.workSamples?.length) {
        await Promise.all(
          existingMember.workSamples.map((path) => fs.unlink(path).catch((err) => console.error("Error deleting old work sample:", err)))
        );
      }
    }

    const updatedMember = await GISMember.findOneAndUpdate(
      { _id: memberId, user: userId },
      { $set: updateData },
      { new: true, session, runValidators: true }
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "GIS Member data updated successfully",
      data: { memberId: updatedMember._id },
    });
  } catch (error) {
    await session.abortTransaction();
    if (req.files) {
      await Promise.all(
        Object.values(req.files)
          .flat()
          .map((file) => fs.unlink(file.path).catch((err) => console.error("File cleanup error:", err)))
      );
    }
    res.status(error.message.includes("Unauthorized") ? 401 : error.message.includes("Invalid") ? 400 : 500).json({
      success: false,
      message: error.message,
      ...(process.env.NODE_ENV === "development" && { error: error.stack }),
    });
  } finally {
    session.endSession();
  }
};


export const checkForDraft = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized: Please log in first" });

    const draft = await GISMember.findOne({ user: userId, isDraft: true }).lean();

    if (!draft) {
      return res.status(200).json({
        success: true,
        exists: false,
      });
    }

    res.status(200).json({
      success: true,
      exists: true,
      draftData: {
        ...draft,
        lastSavedTab: draft.lastSavedTab,
        savedTabs: draft.savedTabs || [],
      },
    });
  } catch (error) {
    console.error("Error checking for draft:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check for draft",
      ...(process.env.NODE_ENV === "development" && { error: error.stack }),
    });
  }
};


export const getGISMemberData = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required" });

    const member = await GISMember.findOne({ user: userId, isDraft: false }).lean();
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "No GIS member data found",
      });
    }

    const memberData = {
      fullName: member.fullName,
      dob: member.dob,
      gender: member.gender,
      contactNumber: member.contactNumber,
      email: member.email,
      nationality: member.nationality,
      address: member.address,
      pinCode: member.pinCode,
      city: member.city,
      state: member.state,
      profileImage: member.profileImage ? `/${member.profileImage}` : null,
      institution: member.institution,
      education: member.education,
      certifications: member.certifications,
      fieldOfStudy: member.fieldOfStudy,
      year: member.year,
      gisSoftware: member.gisSoftware,
      gisSoftwareOther: member.gisSoftwareOther,
      programmingSkills: member.programmingSkills,
      programmingSkillsOther: member.programmingSkillsOther,
      CoreExpertise: member.CoreExpertise,
      CoreExpertiseOther: member.CoreExpertiseOther,
      droneDataProcessing: member.droneDataProcessing,
      photogrammetrySoftware: member.photogrammetrySoftware,
      photogrammetrySoftwareOther: member.photogrammetrySoftwareOther,
      remoteSensing: member.remoteSensing,
      lidarProcessing: member.lidarProcessing,
      experience: member.experience,
      organization: member.organization,
      employer: member.employer,
      linkedIn: member.linkedIn,
      portfolio: member.portfolio,
      jobTitle: member.jobTitle,
      skills: member.skills,
      workMode: member.workMode,
      workType: member.workType,
      workHours: member.workHours,
      availability: member.availability,
      travelWillingness: member.travelWillingness,
      preferredTimeZones: member.preferredTimeZones,
      serviceModes: member.serviceModes,
      projects: member.projects,
      ownEquipment: member.ownEquipment,
      availableEquipment: member.availableEquipment,
      equipmentName: member.equipmentName,
      equipmentBrand: member.equipmentBrand,
      equipmentYear: member.equipmentYear,
      equipmentSpecs: member.equipmentSpecs,
      maintenanceSchedule: member.maintenanceSchedule,
      droneCertification: member.droneCertification,
      certificationFile: member.certificationFile ? `/${member.certificationFile}` : null,
      equipmentRental: member.equipmentRental,
      rentalTerms: member.rentalTerms,
      workSamples: member.workSamples?.map((sample) => `/${sample}`) || [],
      videoShowcase: member.videoShowcase,
      acceptTerms: member.acceptTerms,
      consentMarketing: member.consentMarketing,
      status: member.status,
      submittedAt: member.submittedAt,
      profileCompletion: member.profileCompletion,
    };

    res.status(200).json({
      success: true,
      message: "GIS Member data retrieved successfully",
      data: memberData,
    });
  } catch (error) {
    console.error("Error fetching GIS data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch GIS data",
      ...(process.env.NODE_ENV === "development" && { error: error.stack }),
    });
  }
};

export const deleteDraft = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const userId = req.user?._id;
    if (!userId) throw new Error("Unauthorized: Please log in first");

    const draft = await GISMember.findOne({ user: userId, isDraft: true }).session(session);
    if (!draft) throw new Error("No draft found");

    // Delete any uploaded files associated with the draft
    const filePaths = [
      draft.profileImage,
      draft.certificationFile,
      ...(draft.workSamples || []),
    ].filter(Boolean);

    await Promise.all(
      filePaths.map((path) => fs.unlink(path).catch((err) => console.error("File deletion error:", err)))
    );

    await GISMember.deleteOne({ _id: draft._id }).session(session);

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Draft deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("DeleteDraft Error:", error.message, error.stack);
    res.status(error.message.includes("Unauthorized") ? 401 : 500).json({
      success: false,
      message: error.message,
      ...(process.env.NODE_ENV === "development" && { error: error.stack }),
    });
  } finally {
    session.endSession();
  }
};

export const getGISProfile = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      throw new Error("Unauthorized: User ID not found");
    }

    const profile = await GISMember.findOne({ user: userId, isDraft: false }).lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "GIS Profile not found",
      });
    }

    // Format profile data
    const profileData = {
      fullName: profile.fullName,
      dob: profile.dob,
      gender: profile.gender,
      contactNumber: profile.contactNumber,
      email: profile.email,
      nationality: profile.nationality,
      address: profile.address,
      pinCode: profile.pinCode,
      city: profile.city,
      state: profile.state,
      profileImage: profile.profileImage ? `/${profile.profileImage}` : null,
      institution: profile.institution,
      education: profile.education,
      certifications: profile.certifications,
      fieldOfStudy: profile.fieldOfStudy,
      year: profile.year,
      gisSoftware: profile.gisSoftware,
      gisSoftwareOther: profile.gisSoftwareOther,
      programmingSkills: profile.programmingSkills,
      programmingSkillsOther: profile.programmingSkillsOther,
      CoreExpertise: profile.CoreExpertise,
      CoreExpertiseOther: profile.CoreExpertiseOther,
      droneDataProcessing: profile.droneDataProcessing,
      photogrammetrySoftware: profile.photogrammetrySoftware,
      photogrammetrySoftwareOther: profile.photogrammetrySoftwareOther,
      remoteSensing: profile.remoteSensing,
      lidarProcessing: profile.lidarProcessing,
      experience: profile.experience,
      organization: profile.organization,
      employer: profile.employer,
      linkedIn: profile.linkedIn,
      portfolio: profile.portfolio,
      jobTitle: profile.jobTitle,
      skills: profile.skills,
      workMode: profile.workMode,
      workType: profile.workType,
      workHours: profile.workHours,
      availability: profile.availability,
      travelWillingness: profile.travelWillingness,
      preferredTimeZones: profile.preferredTimeZones,
      serviceModes: profile.serviceModes,
      projects: profile.projects,
      ownEquipment: profile.ownEquipment,
      availableEquipment: profile.availableEquipment,
      equipmentName: profile.equipmentName,
      equipmentBrand: profile.equipmentBrand,
      equipmentYear: profile.equipmentYear,
      equipmentSpecs: profile.equipmentSpecs,
      maintenanceSchedule: profile.maintenanceSchedule,
      droneCertification: profile.droneCertification,
      certificationFile: profile.certificationFile ? `/${profile.certificationFile}` : null,
      equipmentRental: profile.equipmentRental,
      rentalTerms: profile.rentalTerms,
      workSamples: profile.workSamples?.map((sample) => `/${sample}`) || [],
      videoShowcase: profile.videoShowcase,
      acceptTerms: profile.acceptTerms,
      consentMarketing: profile.consentMarketing,
      status: profile.status,
      submittedAt: profile.submittedAt,
      profileCompletion: profile.profileCompletion,
    };

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: profileData,
    });
  } catch (error) {
    console.error("Error fetching GIS profile:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch GIS profile",
      ...(process.env.NODE_ENV === "development" && { error: error.stack }),
    });
  }
};