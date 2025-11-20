import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, LogOut, BookOpen } from 'lucide-react';
import LoginSwitcher from './components/LoginSwitcher';
import CreatorView from './components/CreatorView';
import ApproverView from './components/ApproverView';
import CompletedView from './components/CompletedView';
import WalletInfo from './components/WalletInfo';
import VerificationPortal from './components/VerificationPortal';
import DocumentationPage from './components/DocumentationPage';

// API base URL - works for both manual and Docker setups
const API_BASE = 'http://localhost:5000/api';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState('login');
  const [requests, setRequests] = useState([]);
  const [walletInfo, setWalletInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch wallet info on mount
  useEffect(() => {
    fetchWalletInfo();
  }, []);

  // Fetch requests when user changes
  useEffect(() => {
    if (currentUser) {
      fetchRequests();
    }
  }, [currentUser]);

  const fetchWalletInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE}/wallet-info`);
      setWalletInfo(response.data);
    } catch (error) {
      console.error('Error fetching wallet info:', error);
    }
  };

  const fetchRequests = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/requests/${currentUser.email}`);
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('login');
    setRequests([]);
  };

  const handleRequestAirdrop = async () => {
    try {
      const response = await axios.post(`${API_BASE}/request-airdrop`, { amount: 2 });
      alert(`Airdrop successful! New balance: ${response.data.newBalance} SOL`);
      fetchWalletInfo();
    } catch (error) {
      alert(`Airdrop failed: ${error.response?.data?.message || error.message}`);
    }
  };

  if (activeView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoginSwitcher onLogin={handleLogin} />
      </div>
    );
  }

  // Separate requests by role
  const myInitiatedRequests = requests.filter(req => req.initiator === currentUser.email);
  const pendingApprovals = requests.filter(req => {
    const approver = req.approvers.find(app => app.email === currentUser.email);
    return approver && !approver.signed && req.status !== 'completed';
  });
  const completedRequests = requests.filter(req => req.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                KTern Evidence Engine
              </h1>
              <p className="text-sm text-gray-600">
                Tamper-Proof Auditable Sign-Off with Blockchain Anchoring
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-600">{currentUser.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Wallet Info Banner */}
      <WalletInfo
        walletInfo={walletInfo}
        onRequestAirdrop={handleRequestAirdrop}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'dashboard'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
              {pendingApprovals.length > 0 && (
                <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                  {pendingApprovals.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveView('create')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'create'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Create Signoff
            </button>
            <button
              onClick={() => setActiveView('completed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'completed'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Completed ({completedRequests.length})
            </button>
            <button
              onClick={() => setActiveView('verify')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeView === 'verify'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Search size={16} />
              Verify Document
            </button>
            <button
              onClick={() => setActiveView('docs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeView === 'docs'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BookOpen size={16} />
              Documentation
            </button>
          </nav>
        </div>

        {/* View Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : (
          <>
            {activeView === 'dashboard' && (
              <ApproverView
                currentUser={currentUser}
                pendingApprovals={pendingApprovals}
                myInitiatedRequests={myInitiatedRequests}
                onRefresh={fetchRequests}
              />
            )}
            {activeView === 'create' && (
              <CreatorView
                currentUser={currentUser}
                onRequestCreated={() => {
                  fetchRequests();
                  setActiveView('dashboard');
                }}
              />
            )}
            {activeView === 'completed' && (
              <CompletedView
                completedRequests={completedRequests}
                currentUser={currentUser}
              />
            )}
            {activeView === 'verify' && (
              <VerificationPortal />
            )}
            {activeView === 'docs' && (
              <DocumentationPage />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
