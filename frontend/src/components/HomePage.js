import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, Ship, Package, BarChart, Settings, Box, Users, FileText, ShieldCheck, Globe } from 'lucide-react';

function HomePage() {
  const [showRoleModal, setShowRoleModal] = useState(false);

  const features = [
    {
      title: 'Compliance Checker',
      icon: <ShieldCheck className="h-8 w-8" />,
      description: 'Verify shipment compliance with regulations',
      // Instead of a path, we use an action to open the role selection modal
      action: () => setShowRoleModal(true),
      color: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600'
    },
    {
      title: 'Cross-Border Router',
      icon: <Globe className="h-8 w-8" />,
      description: 'Optimize routes for cost, time and feasibility',
      path: '/route-optimizer',
      color: 'bg-teal-50 hover:bg-teal-100 text-teal-600'
    }
  ];

  const roles = [
    {
      title: 'Clerk',
      icon: <ClipboardCheck className="h-6 w-6" />,
      path: '/clerk',
      color: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
    },
    {
      title: 'Manager',
      icon: <BarChart className="h-6 w-6" />,
      path: '/dashboard',
      color: 'bg-teal-100 text-teal-600 hover:bg-teal-200'
    },
    {
      title: 'Admin',
      icon: <Settings className="h-6 w-6" />,
      path: '/admin',
      color: 'bg-amber-100 text-amber-600 hover:bg-amber-200'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Ship className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-2xl font-bold text-indigo-700">Vership</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">
                Features
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Global Trade Compliance Made Simple
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Automated compliance checks and intelligent routing for cross-border shipments
            </p>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Our Solutions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                onClick={feature.action ? feature.action : undefined}
                className={`flex flex-col items-center p-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 ${feature.color} border border-gray-200 cursor-pointer`}
              >
                {feature.path && !feature.action ? (
                  <Link to={feature.path} className="flex flex-col items-center w-full h-full">
                    <div className="p-3 rounded-full mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-medium mb-2 text-center">
                      {feature.title}
                    </h3>
                    <p className="text-center text-gray-700">
                      {feature.description}
                    </p>
                  </Link>
                ) : (
                  <>
                    <div className="p-3 rounded-full mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-medium mb-2 text-center">
                      {feature.title}
                    </h3>
                    <p className="text-center text-gray-700">
                      {feature.description}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Role Selection Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Select User Type</h3>
            <div className="grid grid-cols-1 gap-4">
              {roles.map((role, index) => (
                <Link
                  key={index}
                  to={role.path}
                  className={`flex items-center p-4 rounded-md ${role.color} transition-colors duration-200`}
                  onClick={() => setShowRoleModal(false)}
                >
                  <div className="mr-4">
                    {role.icon}
                  </div>
                  <span className="font-medium">{role.title}</span>
                </Link>
              ))}
            </div>
            <button
              onClick={() => setShowRoleModal(false)}
              className="mt-6 w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-600 text-sm">
          © 2025 Vership. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
