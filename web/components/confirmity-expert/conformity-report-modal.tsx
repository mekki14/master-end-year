// components/ConformityReportModal.tsx
import React, { useState } from 'react';
import {
  X,
  Shield,
  Car,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Stamp,
  Award,
  Upload,
  Link,
} from 'lucide-react';
import { useCreateConformityReport } from './conformity-data-access';

interface ConformityReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  car?: {
    vin: string;
    brand: string;
    model: string;
    year: number;
    color: string;
    ownerName: string;
    publicKey: string;
  };
  onSubmit: (reportData: any) => void;
  isLoading?: boolean;
}

const ConformityReportModal: React.FC<ConformityReportModalProps> = ({
  isOpen,
  onClose,
  car,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    conformityExpertUsername: '',
    conformityStatus: true,
    modifications: '',
    notes: '',
    fullReportUri: '',
    minesStamp: `MINES-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 6)
      .toUpperCase()}`,
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.fullReportUri.trim()) {
      errors.fullReportUri = 'Report URI is required';
    } else if (
      !formData.fullReportUri.startsWith('ipfs://') &&
      !formData.fullReportUri.startsWith('https://')
    ) {
      errors.fullReportUri = 'URI must start with ipfs:// or https://';
    }

    if (!formData.conformityStatus && !formData.modifications.trim()) {
      errors.modifications =
        'Modifications are required when status is non-conforming';
    }

    if (formData.modifications.length > 256) {
      errors.modifications = 'Modifications must be less than 256 characters';
    }

    if (formData.notes.length > 512) {
      errors.notes = 'Notes must be less than 512 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
 
  const createReport = useCreateConformityReport();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      console.log(car);
      await createReport.mutateAsync({
        reportData: {
          carVin: car.vin,

          ...formData,
        },
        car,
      });
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      conformityStatus: true,
      modifications: '',
      notes: '',
      fullReportUri: '',
      minesStamp: `MINES-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 6)
        .toUpperCase()}`,
    });
    setValidationErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl border border-green-500/20 shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 border-b border-green-500/20 bg-gradient-to-r from-green-900/20 to-transparent">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-lg transition-colors group"
          >
            <X className="h-5 w-5 text-gray-400 group-hover:text-white" />
          </button>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-xl border border-green-500/30">
              <Shield className="h-8 w-8 text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Issue Conformity Certificate
              </h2>
              <p className="text-gray-400 mt-1">
                Assess vehicle compliance with regulatory standards
              </p>
            </div>
          </div>
        </div>

        {/* Car Information Card */}
        {car && (
          <div className="p-6 border-b border-gray-800">
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600">
              <div className="flex items-center gap-3 mb-6">
                <Car className="h-6 w-6 text-green-400" />
                <h3 className="text-lg font-semibold text-white">
                  Vehicle Information
                </h3>
                <div className="h-px bg-gradient-to-r from-green-500/50 to-transparent flex-1 ml-4"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">
                      VIN Number
                    </p>
                    <p className="text-white font-mono text-sm bg-gray-900/50 px-3 py-2 rounded-lg border border-gray-700">
                      {car.vin}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">
                      Owner
                    </p>
                    <p className="text-white text-sm">
                      {car.ownerName || 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">
                      Vehicle
                    </p>
                    <p className="text-white text-sm font-medium">
                      {car.brand} {car.model}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {car.year} • {car.color}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">
                      Assessment Date
                    </p>
                    <p className="text-white text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-400" />
                      {new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">
                      Certificate ID
                    </p>
                    <p className="text-green-400 text-sm font-mono bg-green-900/20 px-3 py-2 rounded-lg border border-green-500/30">
                      {formData.minesStamp}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Expert Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-3">
              <User className="inline w-4 h-4 mr-2" />
              Expert Username <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.conformityExpertUsername}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    conformityExpertUsername: e.target.value,
                  }))
                }
                className={`w-full px-4 py-3 pl-12 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:border-transparent transition-all ${
                  validationErrors.conformityExpertUsername
                    ? 'border-red-500 focus:ring-red-500/50'
                    : 'border-gray-600 focus:ring-green-500/50'
                }`}
                placeholder="Enter your expert username..."
              />
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {validationErrors.conformityExpertUsername && (
              <p className="text-red-400 text-xs mt-1">
                {validationErrors.conformityExpertUsername}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-2">
              Your registered expert username for certificate validation
            </p>
          </div>
          {/* Conformity Status Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-4">
              <Award className="inline w-4 h-4 mr-2" />
              Conformity Assessment <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, conformityStatus: true }))
                }
                className={`group relative p-6 rounded-xl border-2 transition-all duration-300 ${
                  formData.conformityStatus
                    ? 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20'
                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800'
                }`}
              >
                <div className="text-center">
                  <CheckCircle
                    className={`h-8 w-8 mx-auto mb-3 ${
                      formData.conformityStatus
                        ? 'text-green-400'
                        : 'text-gray-400 group-hover:text-gray-300'
                    }`}
                  />
                  <p
                    className={`font-semibold text-lg ${
                      formData.conformityStatus
                        ? 'text-green-400'
                        : 'text-gray-300'
                    }`}
                  >
                    Compliant
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      formData.conformityStatus
                        ? 'text-green-300/70'
                        : 'text-gray-500'
                    }`}
                  >
                    Meets all regulatory requirements
                  </p>
                </div>
                {formData.conformityStatus && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, conformityStatus: false }))
                }
                className={`group relative p-6 rounded-xl border-2 transition-all duration-300 ${
                  !formData.conformityStatus
                    ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20'
                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800'
                }`}
              >
                <div className="text-center">
                  <XCircle
                    className={`h-8 w-8 mx-auto mb-3 ${
                      !formData.conformityStatus
                        ? 'text-red-400'
                        : 'text-gray-400 group-hover:text-gray-300'
                    }`}
                  />
                  <p
                    className={`font-semibold text-lg ${
                      !formData.conformityStatus
                        ? 'text-red-400'
                        : 'text-gray-300'
                    }`}
                  >
                    Non-Compliant
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      !formData.conformityStatus
                        ? 'text-red-300/70'
                        : 'text-gray-500'
                    }`}
                  >
                    Requires modifications
                  </p>
                </div>
                {!formData.conformityStatus && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Required Modifications - Only show when non-compliant */}
          {!formData.conformityStatus && (
            <div className="bg-red-900/10 border border-red-500/30 rounded-xl p-6">
              <label className="block text-sm font-semibold text-red-300 mb-3">
                <AlertTriangle className="inline w-4 h-4 mr-2" />
                Required Modifications <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.modifications}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    modifications: e.target.value,
                  }))
                }
                className={`w-full px-4 py-3 bg-gray-900/50 border rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:border-transparent resize-none transition-all ${
                  validationErrors.modifications
                    ? 'border-red-500 focus:ring-red-500/50'
                    : 'border-gray-600 focus:ring-green-500/50'
                }`}
                rows={4}
                maxLength={256}
                placeholder="Detail the specific modifications required for compliance..."
              />
              <div className="flex justify-between items-center mt-2">
                {validationErrors.modifications && (
                  <p className="text-red-400 text-xs">
                    {validationErrors.modifications}
                  </p>
                )}
                <p className="text-gray-500 text-xs ml-auto">
                  {formData.modifications.length}/256 characters
                </p>
              </div>
            </div>
          )}

          {/* Report Documentation */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-3">
              <FileText className="inline w-4 h-4 mr-2" />
              Certificate Document URI <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.fullReportUri}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    fullReportUri: e.target.value,
                  }))
                }
                className={`w-full px-4 py-3 pl-12 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:border-transparent transition-all ${
                  validationErrors.fullReportUri
                    ? 'border-red-500 focus:ring-red-500/50'
                    : 'border-gray-600 focus:ring-green-500/50'
                }`}
                placeholder="ipfs://QmCertificateDocument... or https://..."
              />
              <Link className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {validationErrors.fullReportUri && (
              <p className="text-red-400 text-xs mt-1">
                {validationErrors.fullReportUri}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-2">
              IPFS or HTTPS URI containing the detailed conformity certificate
            </p>
          </div>

          {/* Mines Stamp */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-3">
              <Stamp className="inline w-4 h-4 mr-2" />
              Official Certificate Stamp
            </label>
            <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-mono text-sm">
                    {formData.minesStamp}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Auto-generated certificate identifier
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      minesStamp: `MINES-${Date.now()}-${Math.random()
                        .toString(36)
                        .substr(2, 6)
                        .toUpperCase()}`,
                    }))
                  }
                  className="btn btn-outline btn-sm"
                >
                  Regenerate
                </button>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-3">
              <FileText className="inline w-4 h-4 mr-2" />
              Expert Notes & Observations
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:border-transparent resize-none transition-all ${
                validationErrors.notes
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-gray-600 focus:ring-green-500/50'
              }`}
              rows={4}
              maxLength={512}
              placeholder="Additional observations, recommendations, or expert comments..."
            />
            <div className="flex justify-between items-center mt-2">
              {validationErrors.notes && (
                <p className="text-red-400 text-xs">{validationErrors.notes}</p>
              )}
              <p className="text-gray-500 text-xs ml-auto">
                {formData.notes.length}/512 characters
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-800">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-gray-700 text-gray-300 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-200"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.fullReportUri || isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-semibold hover:from-green-500 hover:to-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-green-500/25"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
                  Issuing Certificate...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Issue Certificate
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConformityReportModal;
