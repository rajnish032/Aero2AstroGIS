"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Spin } from 'antd';

const DashboardPage = ({ isSidebarOpen }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          <div className="flex items-center justify-center min-h-screen">
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
    <div 
      className="min-h-screen bg-gray-100 transition-all duration-300"
    >
      <div className="p-4 md:p-6">
        {/* Technical Skills Section */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-600 bg-blue-50 p-2 rounded">
            Technical Skills
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderSkillSection("GIS Software", profile.gisSoftware)}
            {renderSkillSection("Programming", profile.programmingSkills)}
            {renderSkillSection("Core Expertise", profile.CoreExpertise)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-lg mb-2 text-blue-600">Photogrammetry</h3>
              <div className="space-y-2">
                <p>
                  <strong>Software:</strong>{" "}
                  {profile.photogrammetrySoftware?.join(", ") || "None"}
                </p>
                <p>
                  <strong>Skill Level:</strong>{" "}
                  {profile.droneDataProcessing || "Not specified"}
                </p>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-lg mb-2 text-blue-600">Remote Sensing</h3>
              <div className="space-y-2">
                <p>
                  <strong>LiDAR Processing:</strong>{" "}
                  {profile.lidarProcessing || "None"}
                </p>
                <p>
                  <strong>General Skill Level:</strong>{" "}
                  {profile.remoteSensing || "Not specified"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Equipment Section */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-600 bg-blue-50 p-2 rounded">
            Equipment Inventory
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderEquipmentSection(profile)}
            {renderCertificationsSection(profile)}
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

// Helper component for skill sections
const renderSkillSection = (title, items) => (
  <div className="border rounded-lg p-4">
    <h3 className="font-medium text-lg mb-2 text-blue-600">{title}</h3>
    <ul className="space-y-1">
      {items?.length > 0 ? (
        items.map((item, index) => (
          <li key={index} className="flex items-center">
            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
            {item}
          </li>
        ))
      ) : (
        <li className="text-gray-500">None listed</li>
      )}
    </ul>
  </div>
);

// Helper component for equipment section
const renderEquipmentSection = (profile) => (
  <div className="border rounded-lg p-4">
    <h3 className="font-medium text-lg mb-3 text-blue-600">
      {profile.ownEquipment === "Yes" ? "My Equipment" : "No Equipment Registered"}
    </h3>
    
    {profile.ownEquipment === "Yes" ? (
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <span className="font-medium">Available Equipment:</span>
          <span className="text-gray-700">
            {profile.availableEquipment?.join(", ") || "None specified"}
          </span>
        </div>

        {profile.equipmentName && (
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-medium mb-2">Primary Device</h4>
            <ul className="space-y-1">
              <li><strong>Name:</strong> {profile.equipmentName}</li>
              <li><strong>Brand:</strong> {profile.equipmentBrand || "N/A"}</li>
              <li><strong>Year:</strong> {profile.equipmentYear || "N/A"}</li>
              {profile.equipmentSpecs && (
                <li><strong>Specs:</strong> {profile.equipmentSpecs}</li>
              )}
            </ul>
          </div>
        )}

        {profile.equipmentRental === "Yes" && (
          <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-100">
            <h4 className="font-medium text-yellow-700">Rental Available</h4>
            <p>{profile.rentalTerms || "Contact for terms"}</p>
          </div>
        )}
      </div>
    ) : (
      <p className="text-gray-500">You have not registered any equipment yet</p>
    )}
  </div>
);

// Helper component for certifications section
const renderCertificationsSection = (profile) => (
  <div className="border rounded-lg p-4">
    <h3 className="font-medium text-lg mb-3 text-blue-600">Certifications</h3>
    
    {profile.droneCertification === "Yes" ? (
      <div className="space-y-3">
        <div className="bg-gray-50 p-3 rounded">
          <h4 className="font-medium mb-1">Drone Operations</h4>
          <p>Certified: {profile.droneCertification}</p>
          {profile.certificationFile && (
            <a 
              href={profile.certificationFile} 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-600 rounded text-sm hover:bg-blue-100 transition-colors"
            >
              View Certificate
            </a>
          )}
        </div>

        {profile.maintenanceSchedule && (
          <div>
            <h4 className="font-medium">Maintenance</h4>
            <p>Schedule: {profile.maintenanceSchedule}</p>
          </div>
        )}
      </div>
    ) : (
      <p className="text-gray-500">No certifications registered</p>
    )}
  </div>
);

export default DashboardPage;