// components/BuyRequestModal.tsx
import React, { useState } from 'react';
import { X, MessageSquare, DollarSign, AlertTriangle } from 'lucide-react';

interface BuyRequestModalProps {
  car: {
    brand: string;
    model: string;
    year: number;
    salePrice: number;
    ownerName: string;
    vin: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void;
  isLoading: boolean;
}

const BuyRequestModal: React.FC<BuyRequestModalProps> = ({
  car,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSubmit(message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-gray-900 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-gray-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center">
              <MessageSquare className="w-6 h-6 mr-2" />
              Buy Request
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-400 transition-colors"
              disabled={isLoading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Car Info */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-100 mb-2">
              {car.brand} {car.model} {car.year}
            </h4>
            <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
              <span>Owner: {car.ownerName}</span>
              <span className="font-bold text-indigo-400">
                {(car.salePrice / 1000000000).toFixed(2)} SOL
              </span>
            </div>
            <p className="text-xs text-gray-500">VIN: {car.vin}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Message */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Message to Owner
              </label>
              <textarea
                className="textarea textarea-bordered w-full h-32 resize-none bg-gray-800 text-gray-100 border-gray-700 focus:border-indigo-500"
                placeholder="Hi, I'm interested in buying your car. I'd like to know more about its condition and arrange a viewing..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                disabled={isLoading}
              />
              <div className="text-xs text-gray-500 mt-1">
                {message.length}/500 characters
              </div>
            </div>

            {/* Warning */}
            <div className="alert bg-yellow-900/50 border border-yellow-700 text-yellow-100 mb-6">
              <AlertTriangle className="w-5 h-5" />
              <div>
                <div className="font-medium">Important</div>
                <div className="text-sm">
                  This will send a buy request to the owner. They can accept or reject your request.
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost text-gray-300 hover:bg-gray-800"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={isLoading || !message.trim()}
              >
                {isLoading && <span className="loading loading-spinner loading-sm"></span>}
                Send Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BuyRequestModal;
