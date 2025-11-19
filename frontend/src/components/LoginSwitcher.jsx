import React from 'react';

const MOCK_USERS = [
  { id: 1, name: 'Alice', email: 'alice@example.com', role: 'Initiator', color: 'blue' },
  { id: 2, name: 'Bob', email: 'bob@example.com', role: 'Approver', color: 'green' },
  { id: 3, name: 'Diana', email: 'diana@example.com', role: 'Approver', color: 'purple' }
];

function LoginSwitcher({ onLogin }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Chain of Custody System
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Tamper-Proof Auditable Sign-Off with Blockchain Anchoring
          </p>
          <p className="text-sm text-gray-500">
            Mock Authentication - Select a user to login
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_USERS.map((user) => (
            <button
              key={user.id}
              onClick={() => onLogin(user)}
              className={`bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all transform hover:scale-105 border-2 border-${user.color}-200`}
            >
              <div className="text-center">
                <div className={`w-20 h-20 bg-${user.color}-100 rounded-full mx-auto mb-4 flex items-center justify-center`}>
                  <span className={`text-3xl font-bold text-${user.color}-600`}>
                    {user.name[0]}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  {user.email}
                </p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-${user.color}-100 text-${user.color}-700`}>
                  {user.role}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            System Features
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Visual signature stamps with coordinate mapping</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Cryptographic P12 digital signatures (viewable in Adobe Acrobat)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Blockchain anchoring on Solana Devnet with immutable audit trail</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Complete chain of custody with timestamped history</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default LoginSwitcher;
