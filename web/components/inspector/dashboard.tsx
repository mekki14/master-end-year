'use client'
// pages/inspector/dashboard.tsx
import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, 
  Car, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Search,
  Clock,
  Eye,
  Filter
} from 'lucide-react';
import { useState } from 'react';
import AddReportModal from './AddReportModal';
import { useInspectorData } from '../hooks/use-inspector-data';
import { useGetAllCars } from '../government/government-data-access';
import { useInspectorReports } from './inspector-data-access';
import { useGetCurrentUser } from '../users/user-data-access';

interface CarData {
  publicKey: string;
  carId: string;
  vin: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  owner: string;
  lastInspectionDate: string | null;
  inspectionStatus: 'pending' | 'valid' | 'expired';
  isForSale: boolean;
}

interface InspectionReport {
  publicKey: string;
  car: string;
  confirmityExpert: string;
  carOwner: string;
  reportDate: string;
  conformityStatus: 'approved' | 'rejected' | 'conditional';
  modifications: string;
  fullReportUri: string;
  minesStamp: string;
  notes: string;
  status: 'pending' | 'accepted' | 'rejected';
}

const InspectorDashboard = () => {
  const { publicKey, connected } = useWallet();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddReportModalOpen, setIsAddReportModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarData | null>(null);

  // Get inspector data
  const { data: inspectorData, isLoading: inspectorLoading } = useInspectorData(publicKey);

  // Fetch cars available for inspection
  const { data: cars = [], isLoading: carsLoading } = useGetAllCars();
// Get current user data

  // Fetch inspector's reports
  const { data: reports = [], isLoading: reportsLoading } = useInspectorReports();


  const filteredCars = cars.filter(car => {
    // Convert search term to lowercase once
    const searchTermLower = searchTerm.toLowerCase();
    
    // Check if car details match search term
    const matchesSearch = 
      (car.vin?.toLowerCase() || '').includes(searchTermLower) ||
      (car.brand?.toLowerCase() || '').includes(searchTermLower) ||
      (car.model?.toLowerCase() || '').includes(searchTermLower);

//     // Check if car matches selected filter status
    const matchesFilter = filterStatus === 'all' || 
      (car.inspectionStatus && Object.keys(car.inspectionStatus)[0] === filterStatus);
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'valid': return 'text-green-600 bg-green-100'; 
      case 'expired': return 'text-red-600 bg-red-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'conditional': return 'text-orange-600 bg-orange-100';
      case 'accepted': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'valid': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center space-y-6">
          <Car className="w-16 h-16 text-indigo-400 mx-auto" />
          <h1 className="text-3xl font-bold text-white">Inspector Dashboard</h1>
          <p className="text-gray-300">Connect your wallet to access the inspector dashboard</p>
          <WalletMultiButton className="btn btn-primary" />
        </div>
      </div>
    );
  }

  if (inspectorLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-indigo-400"></div>
      </div>
    );
  }

  if (!inspectorData?.verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center space-y-6">
          <AlertCircle className="w-16 h-16 text-amber-400 mx-auto" />
          <h1 className="text-3xl font-bold text-white">Access Denied</h1>
          <p className="text-gray-300">You must be a verified inspector to access this dashboard</p>
          <div className="alert alert-warning bg-amber-900/50 text-amber-100 border-amber-600">
            <AlertCircle className="w-6 h-6" />
            <span>Please wait for government verification of your inspector account</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Car className="w-8 h-8 text-indigo-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Inspector Dashboard</h1>
                <p className="text-sm text-gray-400">Manage vehicle inspections and reports</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="badge badge-success bg-green-900 text-green-100">Verified Inspector</div>
              <WalletMultiButton />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-blue-900/50 rounded-lg">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-white">{reports.length}</h3>
                <p className="text-gray-400">Total Reports</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-900/50 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-white">
                  {reports.filter(r => r.status === 'pending').length}
                </h3>
                <p className="text-gray-400">Pending Approval</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-green-900/50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-white">
                  {reports.filter(r => r.status === 'accepted').length}
                </h3>
                <p className="text-gray-400">Accepted Reports</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-900/50 rounded-lg">
                <Car className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-white">{cars.length}</h3>
                <p className="text-gray-400">Cars Available</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cars for Inspection */}
        <div className="bg-gray-800 rounded-xl shadow-lg mb-8 border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Cars Available for Inspection</h2>
              <button
                onClick={() => setIsAddReportModalOpen(true)}
                className="btn btn-primary bg-indigo-600 hover:bg-indigo-700"
                disabled={!selectedCar}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Report
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by VIN, Brand, or Model..."
                  className="input input-bordered w-full pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="select select-bordered bg-gray-700 border-gray-600 text-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="valid">Valid</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {carsLoading ? (
              <div className="p-8 text-center">
                <div className="loading loading-spinner loading-lg text-indigo-400"></div>
              </div>
            ) : (
              <table className="table w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th></th>
                    <th className="text-gray-300">Vehicle Details</th>
                    <th className="text-gray-300">VIN</th>
                    <th className="text-gray-300">Last Inspection</th>
                    <th className="text-gray-300">Status</th>
                    <th className="text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCars.map((car) => (
                    <tr 
                      key={car.vin}
                      className={`hover:bg-gray-700 cursor-pointer transition-colors ${
                        selectedCar?.vin === car.vin ? 'bg-gray-700' : ''
                      }`}
                      onClick={() => setSelectedCar(car)}
                    >
                      <td>
                        <input
                          type="radio"
                          name="selectedCar"
                          className="radio radio-primary"
                          checked={selectedCar?.vin === car.vin}
                          onChange={() => setSelectedCar(car)}
                        />
                      </td>
                      <td>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-700 rounded-lg">
                            <Car className="w-5 h-5 text-gray-300" />
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {car.brand} {car.model}
                            </div>
                            <div className="text-sm text-gray-400">
                              {car.year} • {car.color}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <code className="text-sm bg-gray-700 px-2 py-1 rounded text-gray-300">
                          {car.vin}
                        </code>
                      </td>
                      <td>
                        {car.lastInspectionDate ? (
                          <span className="text-sm text-gray-300">
                            {new Date(car.lastInspectionDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">Never</span>
                        )}
                      </td>
                      <td>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(Object.keys(car.inspectionStatus)[0])}`}>
                          {getStatusIcon(Object.keys(car.inspectionStatus)[0])}
                          {Object.keys(car.inspectionStatus)[0]}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm text-gray-300 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCar(car);
                            setIsAddReportModalOpen(true);
                          }}
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {filteredCars.length === 0 && !carsLoading && (
            <div className="p-8 text-center text-gray-400">
              <Car className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p>No cars found matching your criteria</p>
            </div>
          )}
        </div>

        {/* Recent Reports */}
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Recent Reports</h2>
          </div>

          <div className="p-6">
  {reportsLoading ? (
    <div className="text-center py-12">
      <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
      <p className="text-base-content/60">Loading inspection reports...</p>
    </div>
  ) : reports.length > 0 ? (
    <div className="space-y-6">
      {reports.map((report, index) => (
        <div 
          key={`${report.car}-${report.reportDate}-${index}`} 
          className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-300"
        >
          <div className="card-body">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-12 h-12">
                    <FileText className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="card-title text-lg">Inspection Report</h3>
                  <p className="text-base-content/60 text-sm">
                    Report Date: {new Date(parseInt(report.reportDate, 16) * 1000).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="flex items-center space-x-2">
                <div className={`badge ${report.approvedByOwner ? 'badge-success' : 'badge-warning'} gap-2`}>
                  {report.approvedByOwner ? (
                    <>
                      <div className="w-2 h-2 bg-success-content rounded-full"></div>
                      Approved
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-warning-content rounded-full animate-pulse"></div>
                      Pending Approval
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Car className="w-4 h-4 text-base-content/60" />
                  <span className="text-sm font-medium">Vehicle Information</span>
                </div>
                <div className="pl-6 space-y-1">
                  <p className="text-sm text-base-content/80">
                    <span className="font-medium">Car ID:</span> {report.car.slice(0, 8)}...{report.car.slice(-8)}
                  </p>
                  <p className="text-sm text-base-content/80">
                    <span className="font-medium">Owner:</span> {report.carOwner.slice(0, 8)}...{report.carOwner.slice(-8)}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-base-content/60" />
                  <span className="text-sm font-medium">Inspector</span>
                </div>
                <div className="pl-6">
                  <p className="text-sm text-base-content/80">
                    {report.inspector.slice(0, 8)}...{report.inspector.slice(-8)}
                  </p>
                </div>
              </div>
            </div>

            {/* Condition Scores */}
            <div className="mb-4">
              <h4 className="font-medium text-base mb-3">Condition Assessment</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Overall', value: report.overallCondition, icon: '🚗' },
                  { label: 'Engine', value: report.engineCondition, icon: '⚙️' },
                  { label: 'Body', value: report.bodyCondition, icon: '🔧' }
                ].map((condition) => (
                  <div key={condition.label} className="bg-base-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center space-x-2">
                        <span>{condition.icon}</span>
                        <span>{condition.label}</span>
                      </span>
                      <span className="font-bold text-lg">{condition.value}/10</span>
                    </div>
                    <progress 
                      className={`progress w-full ${
                        condition.value >= 8 ? 'progress-success' :
                        condition.value >= 6 ? 'progress-warning' : 'progress-error'
                      }`} 
                      value={condition.value} 
                      max="10"
                    ></progress>
                  </div>
                ))}
              </div>
            </div>

            {/* Report Summary */}
            <div className="mb-4">
              <h4 className="font-medium text-base mb-2">Summary</h4>
              <div className="bg-base-100 rounded-lg p-3">
                <p className="text-sm text-base-content/80">{report.reportSummary}</p>
              </div>
            </div>

            {/* Notes (if any) */}
{report.notes && (
  <div className="bg-base-100 rounded-lg p-4 mb-4">
    <div className="flex items-center gap-2 mb-2">
      <h4 className="font-medium">Additional Notes</h4>
      <div className="w-px h-4 bg-base-content/20" />
      <span className="text-xs text-base-content/60">Inspector Comments</span>
    </div>
    <p className="text-sm text-base-content/80 italic">
      "{report.notes}"
    </p>
  </div>
)}

            {/* Actions */}
            <div className="card-actions justify-end mt-4">
              <div className="join">
                <button 
                  className="btn btn-ghost btn-sm join-item"
                  onClick={() => window.open(report.fullReportUri, '_blank')}
                >
                  <Eye className="w-4 h-4" />
                  View Report
                </button>
                
                <button className="btn btn-ghost btn-sm join-item">
                  <FileText className="w-4 h-4" />
                  Details
                </button>
           
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-16">
      <div className="max-w-sm mx-auto">
        <div className="bg-base-200 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <FileText className="w-12 h-12 text-base-content/40" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Reports Yet</h3>
        <p className="text-base-content/60 mb-6">
          No inspection reports have been created for your vehicles yet.
        </p>
        <button className="btn btn-primary">
          <FileText className="w-4 h-4 mr-2" />
          Create First Report
        </button>
      </div>
    </div>
  )}
</div>

        </div>
      </div>

      {/* Add Report Modal */}
      {selectedCar && (
        <AddReportModal
          isOpen={isAddReportModalOpen}
          onClose={() => {
            setIsAddReportModalOpen(false);
            setSelectedCar(null);
          }}
          car={selectedCar}
        />
      )}
    </div>
  );
};

export default InspectorDashboard;
