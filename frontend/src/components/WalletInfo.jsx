import React, { useState } from 'react';

function WalletInfo({ walletInfo, onRequestAirdrop }) {
  const [isAirdropLoading, setIsAirdropLoading] = useState(false);

  if (!walletInfo) return null;

  const handleAirdropClick = async () => {
    setIsAirdropLoading(true);
    try {
      await onRequestAirdrop();
    } finally {
      setIsAirdropLoading(false);
    }
  };

  const balance = parseFloat(walletInfo.balance);
  const isLowBalance = balance < 0.001;

  return (
    <div className={`${isLowBalance ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'} border-b-2`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Solana Wallet ({walletInfo.network})
              </p>
              <p className="text-xs text-gray-600 font-mono">
                {walletInfo.address}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full ${isLowBalance ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
              <span className="text-sm font-semibold">
                {walletInfo.balance}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isLowBalance && (
              <span className="text-sm text-yellow-700 font-medium">
                Low balance - Request airdrop to anchor documents
              </span>
            )}
            <button
              onClick={handleAirdropClick}
              disabled={isAirdropLoading}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isAirdropLoading && (
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              )}
              {isAirdropLoading ? 'Requesting...' : 'Request Airdrop (2 SOL)'}
            </button>
            <a
              href={walletInfo.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition"
            >
              View on Explorer
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WalletInfo;
