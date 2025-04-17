import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true, unique: true, lowercase: true },
  password: { type: String, trim: true },
  phoneNumber: { type: String, required: true, trim: true },
  countryCode: { type: String, required: true, trim: true },
  areaPin: { type: String, trim: true },
  locality: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  is_verified: { type: Boolean, default: false },
  is_phone_verified: { type: Boolean, default: false },
  isGISRegistered: { type: Boolean, default: false },
  roles: { type: [String], enum: ["user", "admin"], default: ["user"] },
  refreshToken: { type: String }, 
isApplied: { type: Boolean, default: false },
  status: { type: String, default: "pending", enum: ["pending", "review", "approved", "rejected"] },
}, { timestamps: true });


userSchema.index({ phoneNumber: 1, countryCode: 1 }, { unique: true });

const UserModel = mongoose.model("User", userSchema);
export default UserModel;