/**
 * CarePulse Hospital Management System (HMS)
 * Clean Architecture Frontend with Google App Material 3 theme & high-contrast circular icons.
 */

import React, { useState, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import Shell from './components/layout/Shell';
import { PageId } from './components/layout/Sidebar';
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
  const { currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  // Global modal triggers
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  if (!isLoggedIn) {
    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <LoginPage onSuccess={() => setIsLoggedIn(true)} />
      </Suspense>
    );
  }

  const pageTitles: Record<PageId, string> = {
    home: 'Hospital Management System (HMS)',
    dashboard: 'Clinical & Operational Dashboard',
    appointments: 'Appointments & Consultations',
    patients: 'Patient Directory & Records',
    doctors: 'Medical Specialists & Schedule',
    'medical-records': 'Clinical Notes & Prescriptions',
    billing: 'Billing & Hospital Invoices',
    settings: 'Security, RBAC & Audit Trails',
  };

  return (
    <Shell
      currentPage={currentPage}
      onSelectPage={(page) => setCurrentPage(page)}
      pageTitle={pageTitles[currentPage]}
    >
      <Suspense fallback={<PageLoadingFallback />}>
        {currentPage === 'home' && (
          <HomePage
            onNavigate={(page) => setCurrentPage(page)}
            onOpenBooking={() => setIsBookingOpen(true)}
          />
        )}

        {currentPage === 'dashboard' && (
          <Dashboard
            onNavigate={(page) => setCurrentPage(page)}
            onOpenBooking={() => setIsBookingOpen(true)}
            onOpenPatientModal={() => setIsPatientModalOpen(true)}
            onOpenInvoiceModal={() => setIsInvoiceModalOpen(true)}
          />
        )}

        {currentPage === 'appointments' && <AppointmentsPage />}

        {currentPage === 'patients' && <PatientsPage />}

        {currentPage === 'doctors' && <DoctorsPage />}

        {currentPage === 'medical-records' && <MedicalRecordsPage />}

        {currentPage === 'billing' && <BillingPage />}

        {currentPage === 'settings' && <SettingsPage />}
      </Suspense>

      {/* Global Quick Action Modals */}
      <AppointmentBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSuccess={() => {
          setIsBookingOpen(false);
          // If not on appointments page, optionally navigate there
        }}
      />

      <PatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSuccess={() => {
          setIsPatientModalOpen(false);
          setCurrentPage('patients');
        }}
      />

      <InvoiceModal
        isOpen={isInvoiceModalOpen}
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
