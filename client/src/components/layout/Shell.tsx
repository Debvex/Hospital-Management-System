import React, { useState } from 'react';
import Sidebar, { PageId } from './Sidebar';
import Topbar from './Topbar';
import Footer from './Footer';
import AppointmentBookingModal from '../forms/AppointmentBookingModal';

interface ShellProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  children: React.ReactNode;
  pageTitle: string;
}

export const Shell: React.FC<ShellProps> = ({
  currentPage,
  onSelectPage,
  children,
  pageTitle,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#181a20] via-[#14161a] to-[#111317] text-zinc-100">
      {/* Sidebar navigation drawer */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={onSelectPage}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Topbar
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onOpenBookAppointment={() => setIsBookingModalOpen(true)}
          pageTitle={pageTitle}
        />

        <main className="flex-1 overflow-y-auto flex flex-col justify-between">
          <div className={`w-full flex-1 ${currentPage === 'home' ? '' : 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6'}`}>
            {children}
          </div>
          <Footer onSelectPage={onSelectPage} />
        </main>
      </div>

      {/* Global Booking Modal */}
      <AppointmentBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={() => {
          setIsBookingModalOpen(false);
        }}
      />
    </div>
  );
};

export default Shell;
