"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Spin } from 'antd';

const ProjectsPage = ({ isSidebarOpen }) => {
  const [projects, setProjects] = useState([]);
  const [workSamples, setWorkSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/gis-registration/profile`,
          { withCredentials: true }
        );
        setProjects(response.data.data.projects || []);
        setWorkSamples(response.data.data.workSamples || []);
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Failed to load projects";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
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
        {/* Projects Section */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-600 bg-blue-50 p-2 rounded">
            Project Portfolio
          </h2>
          
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-medium text-lg mb-2 text-blue-600">
                    {project.title || `Project ${index + 1}`}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-800">Description</h4>
                      <p className="text-gray-700">
                        {project.description || "No description provided"}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Technologies Used</h4>
                      <p className="text-gray-700">
                        {project.technologies || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No projects registered yet</p>
            </div>
          )}
        </div>

        {/* Work Samples Section */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-600 bg-blue-50 p-2 rounded">
            Work Samples
          </h2>
          
          {workSamples.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {workSamples.map((sample, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {sample.split('/').pop() || `Sample ${index + 1}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {sample.split('.').pop().toUpperCase()} file
                      </p>
                    </div>
                    <a 
                      href={sample} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-sm hover:bg-blue-100 transition-colors"
                    >
                      View
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No work samples uploaded yet</p>
            </div>
          )}
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default ProjectsPage;