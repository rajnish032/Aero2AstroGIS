"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Spin } from 'antd';

const ProfilePage = ({ isSidebarOpen }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Move the function inside the component but before the useEffect
  const getProfileImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // Remove any leading slashes to avoid double slashes in URL
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/${cleanPath}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/gis-registration/profile`,
          { withCredentials: true }
        );
        setProfile(response.data.data);
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Failed to load profile";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-6 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 transition-all duration-300">
      <div className="p-4 md:p-6">
        {/* Personal Information Section */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-600 bg-blue-50 p-2 rounded">
            Personal Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Image */}
            <div className="flex items-center gap-6">
              {profile.profileImage ? (
                <div className="relative">
                  <img 
                    src={getProfileImageUrl(profile.profileImage)} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-24 h-24 rounded-full bg-gray-200 hidden items-center justify-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <div>
                <h3 className="text-2xl font-semibold text-gray-800">{profile.fullName || 'Not specified'}</h3>
                <p className="text-gray-600">{profile.jobTitle || 'No job title'}</p>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                  <p className="text-gray-800">
                    {profile.dob ? new Date(profile.dob).toLocaleDateString() : 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="text-gray-800">{profile.gender || 'Not specified'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-gray-800">{profile.email || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Contact Number</p>
                <p className="text-gray-800">{profile.contactNumber || 'Not specified'}</p>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800">Address</h4>
              <p className="text-gray-700">
                {profile.address || 'No address provided'}
                {profile.city && `, ${profile.city}`}
                {profile.state && `, ${profile.state}`}
                {profile.pinCode && ` - ${profile.pinCode}`}
              </p>
              <div>
                <p className="text-sm font-medium text-gray-500">Nationality</p>
                <p className="text-gray-800">{profile.nationality || 'Not specified'}</p>
              </div>
            </div>

            {/* Professional Links */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800">Professional Links</h4>
              {profile.linkedIn && (
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    LinkedIn Profile
                  </a>
                </div>
              )}
              {profile.portfolio && (
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Portfolio Website
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Education & Professional Information Section */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-600 bg-blue-50 p-2 rounded">
            Education & Professional Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Education */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg text-blue-600">Education</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Institution</p>
                  <p className="text-gray-800">{profile.institution || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Degree/Qualification</p>
                  <p className="text-gray-800">{profile.education || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Field of Study</p>
                  <p className="text-gray-800">{profile.fieldOfStudy || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Year</p>
                  <p className="text-gray-800">{profile.year || 'Not specified'}</p>
                </div>
              </div>

              {profile.certifications?.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Certifications</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {profile.certifications.map((cert, index) => (
                      <li key={index} className="text-gray-700">{cert}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Professional Info */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg text-blue-600">Professional Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Experience</p>
                  <p className="text-gray-800">{profile.experience || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Current/Most Recent Organization</p>
                  <p className="text-gray-800">{profile.organization || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Employment Type</p>
                  <p className="text-gray-800">{profile.employer || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Skills</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {profile.skills?.length > 0 ? (
                      profile.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No skills listed</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default ProfilePage;