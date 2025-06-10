// components/reports/ConformityReports.tsx
'use client';
import { useState } from 'react';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  User, 
  FileText, 
  ExternalLink, 
  Download, 
  ThumbsUp,
  AlertTriangle,
  Clock,
  Award
} from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';

interface ConformityReport {
  reportId: any;
  car: string;
  confirmityExpert: string;
  carOwner: string;
  reportDate: string; // hex timestamp
  conformityStatus: boolean;
  modifications: string;
  minesStamp: string;
  fullReportUri: string;
  acceptedByOwner: boolean;
  notes: string;
  bump: number;
  publicKey: string; // For identification
}

interface ConformityReportsProps {
  reports: ConformityReport[];
  isLoading: boolean;
  onAcceptReport?: (reportKey: string) => Promise<void>;
  currentUserKey?: string;
}

export function ConformityReports({ 
  reports, 
  isLoading, 
  onAcceptReport,
}: ConformityReportsProps) {
  const {publicKey: currentUserKey} = useWallet();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'compliant' | 'non-compliant'>('all');

  const filteredReports = reports?.filter(report => {
    const matchesSearch = report.publicKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.confirmityExpert.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'compliant' && report.conformityStatus) ||
                         (statusFilter === 'non-compliant' && !report.conformityStatus);
    return matchesSearch && matchesStatus;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="form-control flex-1">
              <input
                type="text"
                placeholder="Search by report PDA or expert..."
                className="input input-bordered"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="form-control">
              <select
                className="select select-bordered"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="compliant">Compliant</option>
                <option value="non-compliant">Non-Compliant</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body text-center py-12">
            <Shield className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Conformity Reports Found</h3>
            <p className="text-base-content/70">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No conformity reports have been issued for this vehicle yet.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div key={report.publicKey} className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="card-body">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-success text-success-content rounded-full w-12 h-12">
                        <Shield className="w-6 h-6" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Conformity Report</h3>
                      <p className="text-sm text-base-content/70 font-mono">
                        {report.publicKey.slice(0, 8)}...{report.publicKey.slice(-8)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className={`badge ${report.conformityStatus ? 'badge-success' : 'badge-error'} gap-2`}>
                    {report.conformityStatus ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Compliant
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        Non-Compliant
                      </>
                    )}
                  </div>
                </div>

                {/* Report Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-base-content/60" />
                      <span className="font-medium">Expert:</span>
                      <span className="font-mono text-xs">
                        {report.confirmityExpert.slice(0, 8)}...{report.confirmityExpert.slice(-8)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-base-content/60" />
                      <span className="font-medium">Date:</span>
                      <span>{new Date(parseInt(report.reportDate, 16) * 1000).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="w-4 h-4 text-base-content/60" />
                      <span className="font-medium">Mines Stamp:</span>
                      <span className="text-xs">{report.minesStamp}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-base-content/60" />
                      <span className="font-medium">Owner Approval:</span>
                      <div className={`badge ${report.acceptedByOwner ? 'badge-success' : 'badge-warning'} gap-1`}>
                        {report.acceptedByOwner ? 'Accepted' : 'Pending'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modifications Required */}
                {report.modifications && (
                  <div className="mb-4">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      Modifications Required:
                    </h4>
                    <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                      <p className="text-sm">{report.modifications}</p>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {report.notes && (
                  <div className="mb-4">
                    <h4 className="font-medium text-sm mb-2">Additional Notes:</h4>
                    <div className="bg-base-200 rounded-lg p-3">
                      <p className="text-sm">{report.notes}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="card-actions justify-between items-center">
                  <div className="text-xs text-base-content/50">
                    Car: {report.car.slice(0, 8)}...{report.car.slice(-8)}
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={report.fullReportUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Report
                    </a>
                    <button className="btn btn-outline btn-sm gap-1">
                      <Download className="w-3 h-3" />
                      Export
                    </button>
                    {!report.acceptedByOwner && 
                     onAcceptReport && (
                      <button 
                        onClick={() => onAcceptReport(report.publicKey,report.reportId)}
                        className="btn btn-primary btn-sm gap-1"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        Accept
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
