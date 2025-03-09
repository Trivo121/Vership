//frontend/src/compopnents/ClerkPage.js
import React, { useState, useEffect } from 'react';
import { Filter, Package, CheckCircle, XCircle, Plus, ArrowLeft, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import Form from './Form';

function ClerkPage() {
  const [parcels, setParcels] = useState([]);
  const [filteredParcels, setFilteredParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);

  const fetchParcels = async () => {
    try {
      const response = await fetch('/api/parcels');
      const data = await response.json();
      setParcels(data);
      setFilteredParcels(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching parcels:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParcels();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredParcels(parcels);
    } else {
      setFilteredParcels(parcels.filter(parcel => parcel.status.toLowerCase() === filter));
    }
  }, [filter, parcels]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  // Handle form submission (updated: now just updates UI state)
  const handleFormSubmit = (savedParcel) => {
    setParcels(prev => [savedParcel, ...prev]);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Clerk Dashboard</h1>
              <p className="mt-1 text-gray-500">Manage shipments and compliance</p>
            </div>
            <Link to="/" className="text-blue-600 hover:text-blue-800">
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto">
          {showForm ? (
            <div className="min-h-screen bg-gray-50 p-6">
              <div className="max-w-7xl mx-auto">
                <button 
                  onClick={() => setShowForm(false)}
                  className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  Back to Parcels
                </button>
                <Form onSubmitSuccess={handleFormSubmit} />
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div className="flex space-x-4">
                  <h2 className="text-lg font-semibold text-gray-800">Parcels</h2>
                  <div className="flex items-center space-x-2 text-sm">
                    <Filter size={16} className="text-gray-500" />
                    <button 
                      className={`px-3 py-1 rounded-full ${filter === 'all' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                      onClick={() => handleFilterChange('all')}
                    >
                      All
                    </button>
                    <button 
                      className={`px-3 py-1 rounded-full ${filter === 'compliant' ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100'}`}
                      onClick={() => handleFilterChange('compliant')}
                    >
                      Compliant
                    </button>
                    <button 
                      className={`px-3 py-1 rounded-full ${filter === 'rejected' ? 'bg-red-100 text-red-800' : 'hover:bg-gray-100'}`}
                      onClick={() => handleFilterChange('rejected')}
                    >
                      Rejected
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  Create Parcel
                </button>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading parcels...</p>
                </div>
              ) : (
                <>
                  {filteredParcels.length === 0 ? (
                    <div className="p-12 text-center">
                      <Package size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No parcels found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredParcels.map(parcel => (
                            <tr key={parcel.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{parcel.id}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parcel.sender}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parcel.recipient_address}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parcel.item_type}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parcel.destination}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${parcel.status === 'Compliant' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {parcel.status === 'Compliant' ? <CheckCircle size={12} className="mr-1" /> : <XCircle size={12} className="mr-1" />}
                                  {parcel.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button onClick={() => window.open(`/api/report/${parcel.id}`, '_blank')} className="text-blue-600 hover:text-blue-800">
                                  <FileText size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ClerkPage;
