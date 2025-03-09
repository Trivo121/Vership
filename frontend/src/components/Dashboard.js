import React, { useState, useEffect } from 'react';
import { BarChart, PieChart, TrendingUp } from 'lucide-react';
import { LineChart, Line, Bar, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const [stats, setStats] = useState({
    totalShipments: 0,
    compliantShipments: 0,
    complianceRate: 0,
    avgClearanceTime: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };
    fetchStats();
  }, []);

  // Static data for demonstration charts
  const complianceData = [
    { month: 'Jan', passed: 65, failed: 15 },
    { month: 'Feb', passed: 80, failed: 10 },
    { month: 'Mar', passed: 75, failed: 12 },
    { month: 'Apr', passed: 90, failed: 5 },
  ];

  const routeData = [
    { name: 'Air', value: 35 },
    { name: 'Sea', value: 25 },
    { name: 'Land', value: 40 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Analytics Dashboard</h1>
        
        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Shipments</p>
                <p className="text-2xl font-bold mt-2">{stats.totalShipments}</p>
              </div>
              <BarChart className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Compliance Rate</p>
                <p className="text-2xl font-bold mt-2">{stats.complianceRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Clearance Time</p>
                <p className="text-2xl font-bold mt-2">{stats.avgClearanceTime}h</p>
              </div>
              <PieChart className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Compliance Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={complianceData}>
                  <Line type="monotone" dataKey="passed" stroke="#3B82F6" />
                  <Line type="monotone" dataKey="failed" stroke="#EF4444" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Transport Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <Bar data={routeData} dataKey="value" fill="#3B82F6" />
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
