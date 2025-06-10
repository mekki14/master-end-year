// Update your main reports page to use both components
'use client';
import { useState } from 'react';
import { ArrowLeft, Shield, ClipboardCheck } from 'lucide-react';
import { useParams } from 'next/navigation';
import { ConformityReports } from '@/components/reports/confirmity-report';
import { InspectorReports } from '@/components/reports/inspection-report';
import { useApproveCarReport, useCarReports } from '@/components/inspector/inspector-data-access';
import { useApproveConformityReport, useConformityReports } from '@/components/confirmity-expert/conformity-data-access';

export default function ReportsHistoryPage() {
  const { vin } = useParams();
  const [activeTab, setActiveTab] = useState<'inspection' | 'conformity'>('inspection');

  // Fetch reports for this specific VIN
  const { data: inspectorReports, isLoading, error } = useCarReports(vin as string);
  
  const { mutate: approveReport, isLoading: isApproving } = useApproveCarReport();

  const { mutate: approveConfReport, isLoading: isApprovingConf } = useApproveConformityReport();
  // Separate the reports by type
//   const inspectorReports = allReports?.filter(report => 'overallCondition' in report) || [];
//   const conformityReports = allReports?.filter(report => 'conformityStatus' in report) || [];
  const { data: conformityReports = [], isLoading: reportsLoading } = useConformityReports();
  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <p>Error loading reports. Please try again later.</p>
      </div>
    );
  }

  if (!InspectorReports?.length) {
    return (
      <div className="alert alert-info">
        <p>No reports found for this vehicle.</p>
      </div>
    );
  }


const handleApproveReport = async (reportPda:string,reportId: string) => {
  try {
    await approveReport({
        reportPda,
        reportId,
      carVin: vin as string
    });
  } catch (error) {
    console.error('Error approving report:', error);
  }
};
const handleApproveConfReport = async (reportPda:string,reportId: string) => {
    try {
      await approveConfReport({
          reportPda,
          reportId,
        carVin: vin as string
      });
    } catch (error) {
      console.error('Error approving report:', error);
    }
  };



  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Reports History</h1>
          <p className="text-base-content/70">VIN: {vin}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-6 bg-base-100 shadow-lg p-2">
        <button 
          className={`tab ${activeTab === 'inspection' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('inspection')}
        >
          <ClipboardCheck className="w-4 h-4 mr-2" />
          Inspection Reports ({inspectorReports.length})
        </button>
        <button 
          className={`tab ${activeTab === 'conformity' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('conformity')}
        >
          <Shield className="w-4 h-4 mr-2" />
          Conformity Reports ({conformityReports.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'inspection' ? (
        <InspectorReports 
          reports={inspectorReports}
          isLoading={isLoading}
          onApproveReport={async (reportPda,reportId) => {
            // Handle approval logic
            console.log(reportId)
            handleApproveReport(reportPda,reportId);
          }}
        />
      ) : (
        <ConformityReports 
          reports={conformityReports}
          isLoading={isLoading}
          onAcceptReport={async (reportKey,reportId) => {
            // Handle acceptance logic
            console.log('Accepting conformity report:', reportKey);
            handleApproveConfReport(reportKey,reportId);
          }}
        />
      )}
    </div>
  );
}
