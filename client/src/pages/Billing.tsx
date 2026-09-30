import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Invoice } from '../types';
import BillingTable from '../components/tables/BillingTable';
import InvoiceModal from '../components/forms/InvoiceModal';
import { Button } from '../components/ui/Button';
import { CreditCard, Plus, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const BillingPage: React.FC = () => {
  const { currentRole } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const data = await api.invoices.list();
      setInvoices(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [currentRole]);

  const handleMarkPaid = async (invoiceId: string, method: Invoice['paymentMethod']) => {
    await api.invoices.markPaid(invoiceId, method);
    loadInvoices();
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-100 tracking-tight">
            Hospital Billing Ledger & Invoices
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Itemized consultation fees, diagnostics, and payment reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadInvoices}
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-300" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {(currentRole === 'receptionist' || currentRole === 'administrator') && (
            <Button
              variant="google"
              size="sm"
              onClick={() => setIsInvoiceModalOpen(true)}
              className="font-bold"
            >
              <Plus className="w-4 h-4 text-black stroke-[2.5]" />
              <span>Create Invoice</span>
            </Button>
          )}
        </div>
      </div>

      {/* Invoices Table */}
      <BillingTable
        invoices={invoices}
        onMarkPaid={handleMarkPaid}
        onAddInvoice={() => setIsInvoiceModalOpen(true)}
        isLoading={isLoading}
      />

      {/* Invoice Creation Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onSuccess={() => loadInvoices()}
      />
    </div>
  );
};

export default BillingPage;
