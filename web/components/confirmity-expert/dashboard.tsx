'use client'
import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Shield, 
  Car, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Search,
  Clock,
  Award,
  Filter,
  FileText,
  AlertTriangle,
  Stamp
} from 'lucide-react';
import { useState } from 'react';
import AddConformityReportModal from './conformity-report-modal';
import { useConformityExpertData } from '../hooks/use-conformity-expert-data';
import { useGetAllCars } from '../government/government-data-access';
import { useConformityReports } from './conformity-data-access';
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

interface ConformityReport {
  publicKey: string;
  car: string;
  confirmityExpert: string;
  carOwner: string;
  reportDate: string;
  conformityStatus: boolean;
  modifications: string;
  fullReportUri: string;
  minesStamp: string;
  acceptedByOwner: boolean;
  notes: string;
}

const ConformityExpertDashboard = () => {
  const { publicKey, connected } = useWallet();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddReportModalOpen, setIsAddReportModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarData | null>(null);

  // Get conformity expert data
  const { data: expertData, isLoading: expertLoading } = useConformityExpertData(publicKey);
// Get current user data
const { data: userData } = useGetCurrentUser();
  // Fetch cars available for conformity inspection
  const { data: cars = [], isLoading: carsLoading } = useGetAllCars();

  // Fetch conformity expert's reports
  const { data: reports = [], isLoading: reportsLoading } = useConformityReports();
  console.log("reports",reports)
  const filteredCars = cars.filter(car => {
    const searchTermLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      (car.vin?.toLowerCase() || '').includes(searchTermLower) ||
      (car.brand?.toLowerCase() || '').includes(searchTermLower) ||
      (car.model?.toLowerCase() || '').includes(searchTermLower);

    const matchesFilter = filterStatus === 'all' || 
      (car.inspectionStatus && Object.keys(car.inspectionStatus)[0] === filterStatus);
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'valid': return 'text-green-600 bg-green-100'; 
      case 'expired': return 'text-red-600 bg-red-100';
      case 'compliant': return 'text-green-600 bg-green-100';
      case 'non-compliant': return 'text-red-600 bg-red-100';
      case 'conditional': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'valid': case 'compliant': return <CheckCircle className="w-4 h-4" />;
      case 'expired': case 'non-compliant': return <AlertCircle className="w-4 h-4" />;
      case 'conditional': return <AlertTriangle className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-green-900 flex items-center justify-center">
        <div className="text-center space-y-6">
          <Shield className="w-16 h-16 text-green-400 mx-auto" />
          <h1 className="text-3xl font-bold text-white">Conformity Expert Dashboard</h1>
          <p className="text-gray-300">Connect your wallet to access the conformity expert dashboard</p>
          <WalletMultiButton className="btn btn-primary" />
        </div>
      </div>
    );
  }

  if (expertLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-green-900 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-green-400"></div>
      </div>
    );
  }

  if (!userData?.user?.verificationStatus?.verified || !userData?.user?.role?.confirmityExpert) {
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-green-900 flex items-center justify-center">
        <div className="text-center space-y-6">
          <AlertCircle className="w-16 h-16 text-amber-400 mx-auto" />
          <h1 className="text-3xl font-bold text-white">Access Denied</h1>
          <p className="text-gray-300">You must be a verified conformity expert to access this dashboard</p>
          <div className="alert alert-warning bg-amber-900/50 text-amber-100 border-amber-600">
            <AlertCircle className="w-6 h-6" />
            <span>Please wait for government verification of your conformity expert account</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-green-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-green-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Conformity Expert Dashboard</h1>
                <p className="text-sm text-gray-400">Issue vehicle conformity certificates</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="badge badge-success bg-green-900 text-green-100 gap-2">
                <Award className="w-3 h-3" />
                Verified Expert
              </div>
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
              <div className="p-3 bg-green-900/50 rounded-lg">
                <Shield className="w-6 h-6 text-green-400" />
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
                  {reports.filter(r => !r.acceptedByOwner).length}
                </h3>
                <p className="text-gray-400">Pending Acceptance</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-blue-900/50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-white">
                  {reports.filter(r => r.conformityStatus).length}
                </h3>
                <p className="text-gray-400">Compliant Certificates</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-red-900/50 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-white">
                  {reports.filter(r => !r.conformityStatus).length}
                </h3>
                <p className="text-gray-400">Non-Compliant</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cars for Conformity Check */}
        <div className="bg-gray-800 rounded-xl shadow-lg mb-8 border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Cars Available for Conformity Check</h2>
              <button
                onClick={() => setIsAddReportModalOpen(true)}
                className="btn btn-success bg-green-600 hover:bg-green-700"
                disabled={!selectedCar}
              >
                <Plus className="w-4 h-4 mr-2" />
                Issue Certificate
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
                <div className="loading loading-spinner loading-lg text-green-400"></div>
              </div>
            ) : (
              <table className="table w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th></th>
                    <th className="text-gray-300">Vehicle Details</th>
                    <th className="text-gray-300">VIN</th>
                    <th className="text-gray-300">Inspection Status</th>
                    <th className="text-gray-300">Conformity Status</th>
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
                          className="radio radio-success"
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
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(Object.keys(car.inspectionStatus)[0])}`}>
                          {getStatusIcon(Object.keys(car.inspectionStatus)[0])}
                          {Object.keys(car.inspectionStatus)[0]}
                        </span>
                      </td>
                      <td>
                        {/* Show conformity status if exists */}
                        <span className="text-sm text-gray-500">
                          Not Checked
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
                          <Shield className="w-4 h-4" />
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

        {/* Recent Conformity Reports */}
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Recent Conformity Reports</h2>
          </div>

          <div className="p-6">
            {reportsLoading ? (
              <div className="text-center py-12">
                <div className="loading loading-spinner loading-lg text-success mb-4"></div>
                <p className="text-base-content/60">Loading conformity reports...</p>
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
                            <div className="bg-success text-success-content rounded-full w-12 h-12">
                              <Shield className="w-6 h-6" />
                            </div>
                          </div>
                          <div>
                            <h3 className="card-title text-lg">Conformity Certificate</h3>
                            <p className="text-base-content/60 text-sm">
                              Issue Date: {new Date(parseInt(report.reportDate, 16) * 1000).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        {/* Conformity Status Badge */}
                        <div className="flex items-center space-x-2">
                          <div className={`badge ${report.conformityStatus ? 'badge-success' : 'badge-error'} gap-2`}>
                            {report.conformityStatus ? (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                Compliant
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3 h-3" />
                                Non-Compliant
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Report Details */}
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
                            <Award className="w-4 h-4 text-base-content/60" />
                            <span className="text-sm font-medium">Certification Details</span>
                          </div>
                          <div className="pl-6 space-y-1">
                            <p className="text-sm text-base-content/80">
                              <span className="font-medium">Status:</span> 
                              <span className={`ml-1 ${report.acceptedByOwner ? 'text-success' : 'text-warning'}`}>
                                {report.acceptedByOwner ? 'Accepted' : 'Pending Acceptance'}
                              </span>
                            </p>
                            <p className="text-sm text-base-content/80">
                              <span className="font-medium">Stamp:</span> {report.minesStamp}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Modifications Required */}
                      {report.modifications && (
                        <div className="mb-4">
                          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-warning" />
                            Required Modifications:
                          </h4>
                          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                            <p className="text-sm">{report.modifications}</p>
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {report.notes && (
                        <div className="bg-base-100 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">Expert Notes</h4>
                            <div className="w-px h-4 bg-base-content/20" />
                            <span className="text-xs text-base-content/60">Additional Comments</span>
                          </div>
                          <p className="text-sm text-base-content/80 italic">
                            "{report.notes}"
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="card-actions justify-between items-center mt-4">
                        <div className="text-xs text-base-content/50">
                          Expert: {report.confirmityExpert.slice(0, 8)}...{report.confirmityExpert.slice(-8)}
                        </div>
                        <div className="join">
                          <button 
                            className="btn btn-ghost btn-sm join-item"
                            onClick={() => window.open(report.fullReportUri, '_blank')}
                          >
                            <FileText className="w-4 h-4" />
                            View Certificate
                          </button>
                          
                          <button className="btn btn-ghost btn-sm join-item">
                            <Stamp className="w-4 h-4" />
                            Verify Stamp
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
                    <Shield className="w-12 h-12 text-base-content/40" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Certificates Issued</h3>
                  <p className="text-base-content/60 mb-6">
                    You haven't issued any conformity certificates yet.
                  </p>
                  <button className="btn btn-success">
                    <Shield className="w-4 h-4 mr-2" />
                    Issue First Certificate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Conformity Report Modal */}
      {selectedCar && (
        <AddConformityReportModal
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

export default ConformityExpertDashboard;
