import React, { useState } from 'react';
import { X, FileText, AlertTriangle, Upload, Car } from 'lucide-react';
import { useCreateCarReport } from './inspector-data-access';

interface CarData {
  publicKey: string;
  carId: string;
  vin: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  owner: string;
}

interface AddReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  car: CarData;
  inspector?: any;
}

const AddReportModal: React.FC<AddReportModalProps> = ({
  isOpen,
  onClose,
  car
  
}) => {
  const createReport = useCreateCarReport();
  
  const [formData, setFormData] = useState({
    inspectorUsername: '',
    overallCondition: 5,
    engineCondition: 5,
    bodyCondition: 5,
    fullReportUri: '',
    reportSummary: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        console.log(car)
      await createReport.mutateAsync({
        reportData: {
          carVin: car.vin,
          
          ...formData
        },
        car
      });
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        <div className="relative bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-900 rounded-lg">
                <FileText className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-100">Create Inspection Report</h2>
                <p className="text-sm text-gray-400">Add a new inspection report for this vehicle</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="p-6 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-900 rounded-lg shadow-sm">
                <Car className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-100">
                  {car.brand} {car.model} ({car.year})
                </h3>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>VIN: <code className="bg-gray-900 px-2 py-0.5 rounded">{car.vin}</code></p>
                  <p>Color: {car.color}</p>
                  <p>Car ID: {car.carId}</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                inspector username
              </label>
              <input
                type="text"
                 placeholder="Enter inspector username"
                className="input input-bordered w-full bg-gray-800 text-gray-100 border-gray-700"
                value={formData.inspectorUsername}
                onChange={(e) => handleChange('inspectorUsername', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Overall Condition (1-10) *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                className="input input-bordered w-full bg-gray-800 text-gray-100 border-gray-700"
                value={formData.overallCondition}
                onChange={(e) => handleChange('overallCondition', parseInt(e.target.value))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Engine Condition (1-10) *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                className="input input-bordered w-full bg-gray-800 text-gray-100 border-gray-700"
                value={formData.engineCondition}
                onChange={(e) => handleChange('engineCondition', parseInt(e.target.value))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Body Condition (1-10) *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                className="input input-bordered w-full bg-gray-800 text-gray-100 border-gray-700"
                value={formData.bodyCondition}
                onChange={(e) => handleChange('bodyCondition', parseInt(e.target.value))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Report URI *
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="url"
                  className="input input-bordered flex-1 bg-gray-800 text-gray-100 border-gray-700"
                  placeholder="ipfs://... or https://..."
                  value={formData.fullReportUri}
                  onChange={(e) => handleChange('fullReportUri', e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline btn-square border-gray-700 text-gray-300 hover:bg-gray-700"
                  title="Upload to IPFS"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Upload your detailed inspection report to IPFS or provide a secure URL
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Report Summary *
              </label>
              <textarea
                className="textarea textarea-bordered w-full h-24 resize-none bg-gray-800 text-gray-100 border-gray-700"
                placeholder="Provide a summary of the inspection findings..."
                value={formData.reportSummary}
                onChange={(e) => handleChange('reportSummary', e.target.value)}
                maxLength={512}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Additional Notes
              </label>
              <textarea
                className="textarea textarea-bordered w-full h-24 resize-none bg-gray-800 text-gray-100 border-gray-700"
                placeholder="Any additional observations or recommendations..."
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                maxLength={512}
              />
            </div>

            <div className="alert bg-yellow-900/50 border border-yellow-700">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div>
                <div className="font-medium text-yellow-500">Important Notice</div>
                <div className="text-sm text-yellow-400">
                  This report will be sent to the car owner for approval. 
                  Once approved, it will become part of the vehicle's permanent record.
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost text-gray-300 hover:bg-gray-800"
                disabled={createReport.isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary bg-indigo-600 hover:bg-indigo-700"
                disabled={createReport.isPending || !formData.fullReportUri || !formData.reportSummary}
              >
                {createReport.isPending && <span className="loading loading-spinner loading-sm"></span>}
                Create Report
              </button>
            </div>
          </form>
        </div>
      </div>

      {createReport.isPending && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-gray-900 rounded-xl p-8 shadow-xl text-center">
            <div className="loading loading-spinner loading-lg text-indigo-400 mb-4"></div>
            <p className="text-gray-300">Creating inspection report...</p>
            <p className="text-sm text-gray-400">Please wait while we process your report</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddReportModal;
