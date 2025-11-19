import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

function CreatorView({ currentUser, onRequestCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'contract'
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [approvers, setApprovers] = useState([
    { email: '', x: 50, y: 100, pageNumber: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddApprover = () => {
    setApprovers([...approvers, { email: '', x: 50, y: 100, pageNumber: 0 }]);
  };

  const handleRemoveApprover = (index) => {
    setApprovers(approvers.filter((_, i) => i !== index));
  };

  const handleApproverChange = (index, field, value) => {
    const updated = [...approvers];
    updated[index][field] = value;
    setApprovers(updated);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setError('');
    } else {
      setError('Please select a valid PDF file');
      setPdfFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Request name is required');
      return;
    }

    if (!pdfFile) {
      setError('Please upload a PDF file');
      return;
    }

    if (approvers.length === 0 || approvers.some(app => !app.email.trim())) {
      setError('Please add at least one approver with a valid email');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('initiator', currentUser.email);
      formDataToSend.append('pdf', pdfFile);
      formDataToSend.append('approvers', JSON.stringify(approvers));

      const response = await axios.post(`${API_BASE}/create-request`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Request created successfully!');
      onRequestCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Create New Request
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Q4 Financial Review"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="contract">Contract</option>
                <option value="agreement">Agreement</option>
                <option value="invoice">Invoice</option>
                <option value="report">Report</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* PDF Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload PDF Document *
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {pdfFile && (
              <p className="mt-2 text-sm text-green-600">
                Selected: {pdfFile.name}
              </p>
            )}
          </div>

          {/* Approvers */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Approvers & Signature Coordinates *
              </label>
              <button
                type="button"
                onClick={handleAddApprover}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
              >
                + Add Approver
              </button>
            </div>

            <div className="space-y-4">
              {approvers.map((approver, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 grid grid-cols-4 gap-3">
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={approver.email}
                        onChange={(e) => handleApproverChange(index, 'email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                        placeholder="approver@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        X Coordinate
                      </label>
                      <input
                        type="number"
                        value={approver.x}
                        onChange={(e) => handleApproverChange(index, 'x', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Y Coordinate
                      </label>
                      <input
                        type="number"
                        value={approver.y}
                        onChange={(e) => handleApproverChange(index, 'y', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Page Number
                      </label>
                      <input
                        type="number"
                        value={approver.pageNumber}
                        onChange={(e) => handleApproverChange(index, 'pageNumber', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                        min="0"
                      />
                    </div>
                  </div>
                  {approvers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveApprover(index)}
                      className="mt-6 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Coordinates are measured from the top-left corner of the page. Page numbers start at 0.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          How It Works
        </h3>
        <ol className="space-y-2 text-sm text-blue-800">
          <li>1. Upload a PDF document and provide a name</li>
          <li>2. Add approvers with their email addresses</li>
          <li>3. Specify X, Y coordinates where each approver's signature will appear</li>
          <li>4. Each approver will receive the document and can sign it</li>
          <li>5. After the last signature, the system will:
            <ul className="ml-6 mt-1 space-y-1">
              <li>• Apply a cryptographic P12 digital signature</li>
              <li>• Calculate the SHA-256 hash of the sealed document</li>
              <li>• Anchor the hash to Solana blockchain for tamper-proof verification</li>
            </ul>
          </li>
        </ol>
      </div>
    </div>
  );
}

export default CreatorView;
