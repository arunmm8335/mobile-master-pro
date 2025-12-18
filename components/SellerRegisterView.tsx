import React, { useState } from 'react';
import { User } from '../types';
import { db } from '../services/db';
import { Store, ArrowLeft } from 'lucide-react';

interface SellerRegisterViewProps {
  user: User;
  onSuccess: () => void;
  onBack: () => void;
}

export const SellerRegisterView: React.FC<SellerRegisterViewProps> = ({ user, onSuccess, onBack }) => {
  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    businessEmail: user.email,
    businessPhone: '',
    businessAddress: '',
    gstNumber: '',
    panNumber: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: user.name,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.storeName || !formData.businessPhone || !formData.businessAddress ||
        !formData.accountNumber || !formData.ifscCode) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      await db.registerSeller({
        userId: user.id,
        storeName: formData.storeName,
        storeDescription: formData.storeDescription,
        businessEmail: formData.businessEmail,
        businessPhone: formData.businessPhone,
        businessAddress: formData.businessAddress,
        gstNumber: formData.gstNumber,
        panNumber: formData.panNumber,
        bankDetails: {
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          accountHolderName: formData.accountHolderName,
        },
      });
      
      alert('Seller registration submitted! Your account is pending admin approval.');
      onSuccess();
    } catch (error) {
      console.error('Error registering seller:', error);
      alert('Failed to register as seller. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8">
        <div className="flex items-center gap-3 mb-6">
          <Store className="text-blue-600" size={32} />
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Become a Seller</h2>
            <p className="text-slate-600 dark:text-slate-400">Start selling on MobileMaster Pro</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Store Information */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Store Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Store Name *
                </label>
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  className="w-full p-3 border dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="e.g., Tech Gadgets Store"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Store Description
                </label>
                <textarea
                  value={formData.storeDescription}
                  onChange={(e) => setFormData({ ...formData, storeDescription: e.target.value })}
                  className="w-full p-3 border dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="Describe your store and what you sell..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Business Contact */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Business Contact</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Business Email *
                </label>
                <input
                  type="email"
                  value={formData.businessEmail}
                  onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                  className="w-full p-3 border dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Business Phone *
                </label>
                <input
                  type="tel"
                  value={formData.businessPhone}
                  onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
                  className="w-full p-3 border dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="+91 1234567890"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Business Address *
              </label>
              <textarea
                value={formData.businessAddress}
                onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                className="w-full p-3 border dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                placeholder="Full business address..."
                rows={2}
                required
              />
            </div>
          </div>

          {/* Tax Information */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Tax Information (Optional)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  GST Number
                </label>
                <input
                  type="text"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                  className="w-full p-3 border dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="GST registration number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  PAN Number
                </label>
                <input
                  type="text"
                  value={formData.panNumber}
                  onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                  className="w-full p-3 border dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="PAN card number"
                />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Bank Account Details *</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  value={formData.accountHolderName}
                  onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                  className="w-full p-3 border dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="w-full p-3 border dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    IFSC Code *
                  </label>
                  <input
                    type="text"
                    value={formData.ifscCode}
                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                    className="w-full p-3 border dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    placeholder="e.g., SBIN0001234"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <strong>Note:</strong> Your seller account will be reviewed by our admin team. 
              You'll be notified once approved. After approval, you can start listing products on our platform.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400"
          >
            {loading ? 'Submitting...' : 'Register as Seller'}
          </button>
        </form>
      </div>
    </div>
  );
};
