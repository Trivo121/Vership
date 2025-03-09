import React, { useState, useEffect } from 'react';
import { Plus, Trash } from 'lucide-react';

function AdminPanel() {
  const [rules, setRules] = useState([]);
  const [editingRule, setEditingRule] = useState(null);
  const [newRule, setNewRule] = useState({
    country: '',
    value_threshold: '',
    shipping_requirements: '',
    tariff_info: '',
    additional_info: ''
  });

  const fetchRules = async () => {
    try {
      const response = await fetch('/api/admin/country-rules');
      const data = await response.json();
      setRules(data);
    } catch (error) {
      console.error('Error fetching rules:', error);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleAddRule = async () => {
    try {
      const response = await fetch('/api/admin/country-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule)
      });
      const addedRule = await response.json();
      setRules(prev => [...prev, addedRule]);
      setNewRule({
        country: '',
        value_threshold: '',
        shipping_requirements: '',
        tariff_info: '',
        additional_info: ''
      });
    } catch (error) {
      console.error('Error adding rule:', error);
    }
  };

  const handleDeleteRule = async (id) => {
    try {
      await fetch(`/api/admin/country-rules/${id}`, { method: 'DELETE' });
      setRules(prev => prev.filter(rule => rule.id !== id));
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Compliance Rules Management</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Add New Rule
          </button>
        </div>

        {/* Rules List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value Threshold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shipping Requirements</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tariff Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Additional Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rules.map(rule => (
                <tr key={rule.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rule.country}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rule.value_threshold}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{rule.shipping_requirements}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{rule.tariff_info}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{rule.additional_info}</td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button className="text-red-600 hover:text-red-800" onClick={() => handleDeleteRule(rule.id)}>
                      <Trash className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Form */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{editingRule ? 'Edit Rule' : 'Create New Rule'}</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country Code</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={newRule.country}
                onChange={(e) => setNewRule({ ...newRule, country: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Value Threshold</label>
              <input
                type="number"
                className="w-full p-2 border rounded-md"
                value={newRule.value_threshold}
                onChange={(e) => setNewRule({ ...newRule, value_threshold: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Requirements</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={newRule.shipping_requirements}
                onChange={(e) => setNewRule({ ...newRule, shipping_requirements: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tariff Info</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={newRule.tariff_info}
                onChange={(e) => setNewRule({ ...newRule, tariff_info: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Info</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={newRule.additional_info}
                onChange={(e) => setNewRule({ ...newRule, additional_info: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <button
                onClick={handleAddRule}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                {editingRule ? 'Update Rule' : 'Add Rule'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
