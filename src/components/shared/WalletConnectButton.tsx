'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

interface WalletConnectButtonProps {
  className?: string;
}

const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({ className }) => {
  const { isConnected, walletAddress, connect, disconnect } = useAuth();

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (isConnected && walletAddress) {
    return (
      <button
        onClick={disconnect}
        className={`btn btn-white-dark hover:btn-primary transition-all duration-300 ${className}`}
      >
        {truncateAddress(walletAddress)}
      </button>
    );
  }

  return (
    <button
      onClick={connect}
      className={`btn btn-primary hover:btn-white transition-all duration-300 shadow-lg shadow-primary-500/20 ${className}`}
    >
      Connect Wallet
    </button>
  );
};

export default WalletConnectButton;
