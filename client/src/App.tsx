/**
 * CarePulse Hospital Management System (HMS)
 * Clean Architecture Frontend with Google App Material 3 theme & high-contrast circular icons.
 */

import React, { useEffect, useState, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import Shell from './components/layout/Shell';
import { PageId } from './components/layout/Sidebar';
import { canAccessPage } from './lib/permissions';
import PageLoadingFallback from './components/ui/PageLoadingFallback';

// Lazy Loaded Pages
const HomePage = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AppointmentsPage = lazy(() => import('./pages/Appointments'));
const PatientsPage = lazy(() => import('./pages/Patients'));
const DoctorsPage = lazy(() => import('./pages/Doctors'));
const MedicalRecordsPage = lazy(() => import('./pages/MedicalRecords'));
const BillingPage = lazy(() => import('./pages/Billing'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const LoginPage = lazy(() => import('./pages/Login'));

// Modals
import AppointmentBookingModal from './components/forms/AppointmentBookingModal';
import PatientModal from './components/forms/PatientModal';
import InvoiceModal from './components/forms/InvoiceModal';

function MainApp() {
  const { currentUser, currentRole, isAuthenticated, authScreenMode } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageId>('home');

  // Global modal triggers
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  useEffect(() => {
    if (!canAccessPage(currentRole, currentPage)) setCurrentPage('home');
  }, [currentPage, currentRole]);

  const canBookAppointments = ['administrator', 'receptionist', 'patient'].includes(currentRole);
  const canRegisterPatients = ['administrator', 'receptionist'].includes(currentRole);
  const visiblePage = canAccessPage(currentRole, currentPage) ? currentPage : 'home';

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <LoginPage initialMode={authScreenMode} />
      </Suspense>
    );
  }

  const pageTitles: Record<PageId, string> = {
    home: 'Hospital Management System (HMS)',
    dashboard: 'Clinical & Operational Dashboard',
    appointments: 'Appointments & Consultations',
    patients: currentRole === 'patient' ? 'My Patient Profile' : 'Patient Directory & Records',
    doctors: 'Medical Specialists & Schedule',
    'medical-records': 'Clinical Notes & Prescriptions',
    billing: 'Billing & Hospital Invoices',
    settings: 'Security, RBAC & Audit Trails',
  };

  return (
    <Shell
      currentPage={visiblePage}
      onSelectPage={(page) => setCurrentPage(page)}
      pageTitle={pageTitles[visiblePage]}
    >
      <Suspense fallback={<PageLoadingFallback />}>
        {visiblePage === 'home' && (
          <HomePage
            onNavigate={(page) => setCurrentPage(page)}
            onOpenBooking={() => canBookAppointments && setIsBookingOpen(true)}
          />
        )}

        {visiblePage === 'dashboard' && (
          <Dashboard
            onNavigate={(page) => setCurrentPage(page)}
            onOpenBooking={() => canBookAppointments && setIsBookingOpen(true)}
            onOpenPatientModal={() => canRegisterPatients && setIsPatientModalOpen(true)}
            onOpenInvoiceModal={() => canRegisterPatients && setIsInvoiceModalOpen(true)}
          />
        )}

        {visiblePage === 'appointments' && <AppointmentsPage />}

        {visiblePage === 'patients' && <PatientsPage />}

        {visiblePage === 'doctors' && <DoctorsPage />}

        {visiblePage === 'medical-records' && <MedicalRecordsPage />}

        {visiblePage === 'billing' && <BillingPage />}

        {visiblePage === 'settings' && <SettingsPage />}
      </Suspense>

      {/* Global Quick Action Modals */}
      <AppointmentBookingModal
        isOpen={isBookingOpen && canBookAppointments}
        onClose={() => setIsBookingOpen(false)}
        onSuccess={() => {
          setIsBookingOpen(false);
          // If not on appointments page, optionally navigate there
        }}
      />

      <PatientModal
        isOpen={isPatientModalOpen && canRegisterPatients}
        onClose={() => setIsPatientModalOpen(false)}
        onSuccess={() => {
          setIsPatientModalOpen(false);
          setCurrentPage('patients');
        }}
      />

      <InvoiceModal
        isOpen={isInvoiceModalOpen && canRegisterPatients}
        onClose={() => setIsInvoiceModalOpen(false)}
        onSuccess={() => {
          setIsInvoiceModalOpen(false);
          setCurrentPage('billing');
        }}
      />
    </Shell>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}