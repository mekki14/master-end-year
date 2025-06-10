// components/reports/InspectorReports.tsx
'use client';
import { useState } from 'react';
import { 
  ClipboardCheck, 
  User, 
  Calendar, 
  FileText, 
  ExternalLink, 
  Download, 
  ThumbsUp,
  Clock,
  Star,
  Car,
  Eye
} from 'lucide-react';

interface CarReport {
  reportId: any;
  car: string;
  inspector: string;
  carOwner: string;
  reportDate: string; // hex timestamp
  overallCondition: number;
  engineCondition: number;
  bodyCondition: number;
  fullReportUri: string;
  reportSummary: string;
  approvedByOwner: boolean;
  notes: string;
  bump: number;
  publicKey: string; // For identification
}

interface InspectorReportsProps {
  reports: CarReport[];
  isLoading: boolean;
  onApproveReport?: (reportKey: string) => Promise<void>;
  currentUserKey?: string;
}

export function InspectorReports({ 
  reports, 
  isLoading, 
  onApproveReport,
  currentUserKey 
}: InspectorReportsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [conditionFilter, setConditionFilter] = useState<'all' | 'excellent' | 'good' | 'poor'>('all');

  const getConditionRating = (condition: number) => {
    if (condition >= 8) return 'excellent';
    if (condition >= 6) return 'good';
    return 'poor';
  };

  const getConditionColor = (condition: number) => {
    if (condition >= 8) return 'text-success';
    if (condition >= 6) return 'text-warning';
    return 'text-error';
  };

  const getConditionBg = (condition: number) => {
    if (condition >= 8) return 'bg-success/10 border-success/20';
    if (condition >= 6) return 'bg-warning/10 border-warning/20';
    return 'bg-error/10 border-error/20';
  };

  const filteredReports = reports?.filter(report => {
    const matchesSearch = report.publicKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.inspector.toLowerCase().includes(searchTerm.toLowerCase());
    const overallRating = getConditionRating(report.overallCondition);
    const matchesCondition = conditionFilter === 'all' || overallRating === conditionFilter;
    return matchesSearch && matchesCondition;
  }) || [];

  console.log("reports",filteredReports)
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
                placeholder="Search by report PDA or inspector..."
                className="input input-bordered"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="form-control">
              <select
                className="select select-bordered"
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value as any)}
              >
                <option value="all">All Conditions</option>
                <option value="excellent">Excellent (8-10)</option>
                <option value="good">Good (6-7)</option>
                <option value="poor">Poor (1-5)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body text-center py-12">
            <ClipboardCheck className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Inspection Reports Found</h3>
            <p className="text-base-content/70">
              {searchTerm || conditionFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No inspection reports have been created for this vehicle yet.'}
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
                      <div className="bg-info text-info-content rounded-full w-12 h-12">
                        <ClipboardCheck className="w-6 h-6" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Inspection Report</h3>
                      <p className="text-sm text-base-content/70 font-mono">
                        {report.publicKey.slice(0, 8)}...{report.publicKey.slice(-8)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Approval Status */}
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

                {/* Inspector & Date Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-base-content/60" />
                    <span className="font-medium">Inspector:</span>
                    <span className="font-mono text-xs">
                      {report.inspector.slice(0, 8)}...{report.inspector.slice(-8)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-base-content/60" />
                    <span className="font-medium">Date:</span>
                    <span>{new Date(parseInt(report.reportDate, 16) * 1000).toLocaleDateString()}</span>
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
                      <div key={condition.label} className={`rounded-lg p-3 border ${getConditionBg(condition.value)}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium flex items-center space-x-2">
                            <span>{condition.icon}</span>
                            <span>{condition.label}</span>
                          </span>
                          <span className={`font-bold text-lg ${getConditionColor(condition.value)}`}>
                            {condition.value}/10
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < condition.value 
                                  ? condition.value >= 8 ? 'bg-success' 
                                    : condition.value >= 6 ? 'bg-warning' 
                                    : 'bg-error'
                                  : 'bg-base-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Report Summary */}
                <div className="mb-4">
                  <h4 className="font-medium text-base mb-2">Summary</h4>
                  <div className="bg-base-200 rounded-lg p-3">
                    <p className="text-sm">{report.reportSummary}</p>
                  </div>
                </div>

                {/* Notes */}
                {report.notes && (
                  <div className="mb-4">
                    <h4 className="font-medium text-base mb-2">Inspector Notes</h4>
                    <div className="bg-base-200 rounded-lg p-4 flex items-start gap-3">
                      <FileText className="w-5 h-5 text-base-content/60 mt-0.5" />
                      <p className="text-sm text-base-content/80">{report.notes}</p>
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
                      <Eye className="w-3 h-3" />
                      View Report
                    </a>
                    <button className="btn btn-outline btn-sm gap-1">
                      <Download className="w-3 h-3" />
                      Export
                    </button>
                   
                    {!report.approvedByOwner && 
                     onApproveReport && (
                      <button 
                        onClick={() => onApproveReport(report.publicKey,report.reportId)}
                        className="btn btn-success btn-sm gap-1"
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
