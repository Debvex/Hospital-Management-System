import React, { useState } from 'react';
import { Invoice, PaymentStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { PAYMENT_STATUS_CONFIG } from '../../lib/constants';
import GoogleIconCircle from '../ui/GoogleIconCircle';
import { CreditCard, DollarSign, CheckCircle2, Clock, Eye, Plus, Receipt } from 'lucide-react';
import { Button } from '../ui/Button';
import Modal from '../ui/Modal';
import { useToast } from '../ui/Toast';

interface BillingTableProps {
  invoices: Invoice[];
  onMarkPaid: (invoiceId: string, method: Invoice['paymentMethod']) => void;
  onAddInvoice: () => void;
  isLoading?: boolean;
}

export const BillingTable: React.FC<BillingTableProps> = ({
  invoices,
  onMarkPaid,
  onAddInvoice,
  isLoading = false,
}) => {
  const { currentRole, currentPatientId } = useAuth();
  const { success } = useToast();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Role filtering
  let visibleInvoices = invoices;
  if (currentRole === 'patient' && currentPatientId) {
    visibleInvoices = visibleInvoices.filter((i) => i.patientId === currentPatientId);
  }

  if (filterStatus !== 'all') {
    visibleInvoices = visibleInvoices.filter((i) => i.paymentStatus === filterStatus);
  }

  const handleMarkPaidClick = (invoice: Invoice) => {
    onMarkPaid(invoice.id, 'credit_card');
    success('Payment Recorded', `Invoice ${invoice.invoiceNumber} updated to Paid.`);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status filter tabs */}
        <div className="flex items-center gap-1 p-1 bg-zinc-800/80 rounded-2xl border border-zinc-700/80 overflow-x-auto">
          {['all', 'unpaid', 'paid'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`
                px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer
                ${filterStatus === st ? 'bg-zinc-900 text-white shadow-xs border border-zinc-600' : 'text-zinc-400 hover:text-white'}
              `}
            >
              {st}
            </button>
          ))}
        </div>

        {(currentRole === 'receptionist' || currentRole === 'administrator') && (
          <Button
            variant="google"
            size="sm"
            onClick={onAddInvoice}
            className="self-start sm:self-center font-bold"
          >
            <Plus className="w-4 h-4 text-black stroke-[2.5]" />
            <span>New Invoice</span>
          </Button>
        )}
      </div>

      {/* Invoices Table */}
      <div className="bg-[#181a20] rounded-3xl border border-zinc-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#14161a] border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Invoice #</th>
                <th className="py-3.5 px-4">Patient Name</th>
                <th className="py-3.5 px-4">Charges Breakdown</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400">
                    Loading billing ledger...
                  </td>
                </tr>
              ) : visibleInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <GoogleIconCircle icon={CreditCard} color="red" size="md" />
                      <p className="text-sm font-semibold text-zinc-200">No invoices found</p>
                      <p className="text-xs text-zinc-500">
                        {currentRole === 'patient'
                          ? 'You do not have any pending or past hospital bills.'
                          : 'Try changing the status filter.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                visibleInvoices.map((inv) => {
                  const statusConf = PAYMENT_STATUS_CONFIG[inv.paymentStatus] || PAYMENT_STATUS_CONFIG.unpaid;

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-zinc-800/40 transition-colors duration-100"
                    >
                      {/* Invoice # */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-2">
                          <GoogleIconCircle icon={Receipt} color="red" size="xs" />
                          <span className="font-mono font-bold text-xs text-zinc-100">
                            {inv.invoiceNumber}
                          </span>
                        </div>
                      </td>

                      {/* Patient */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-zinc-100 block">
                          {inv.patientName}
                        </span>
                        {inv.doctorName && (
                          <span className="text-[11px] text-zinc-400 block">
                            Doctor: {inv.doctorName}
                          </span>
                        )}
                      </td>

                      {/* Line Items */}
                      <td className="py-3.5 px-4">
                        <span className="text-zinc-300">
                          {inv.items.length} billable items
                        </span>
                        <span className="text-[11px] text-zinc-500 block truncate max-w-xs">
                          {inv.items.map((i) => i.description).join(', ')}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono tabular-nums text-zinc-400">
                          {inv.dueDate}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-sm text-zinc-100 tabular-nums">
                          ${inv.totalAmount}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`
                            inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold
                            ${statusConf.bg} ${statusConf.text}
                          `}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span className="capitalize">{inv.paymentStatus}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1 font-semibold text-xs"
                            title="View receipt breakdown"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-400" />
                            <span>Details</span>
                          </button>

                          {(currentRole === 'receptionist' || currentRole === 'administrator') &&
                            inv.paymentStatus === 'unpaid' && (
                              <button
                                onClick={() => handleMarkPaidClick(inv)}
                                className="px-2.5 py-1 text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800 hover:bg-emerald-900 rounded-xl transition-colors cursor-pointer"
                              >
                                Mark Paid
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Breakdown Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Hospital Receipt: ${selectedInvoice.invoiceNumber}`}
          subtitle={`Billing statement for ${selectedInvoice.patientName}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-zinc-100">
            {/* Header info */}
            <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="text-zinc-500 block text-[10px]">Payment Status</span>
                <span className="font-bold text-zinc-100 capitalize text-sm">{selectedInvoice.paymentStatus}</span>
              </div>
              <div className="text-right">
                <span className="text-zinc-500 block text-[10px]">Issued Date</span>
                <span className="font-mono text-zinc-300 text-xs">{selectedInvoice.createdAt.split('T')[0]}</span>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border border-zinc-800 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Service Description</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Price</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {selectedInvoice.items.map((it) => (
                    <tr key={it.id}>
                      <td className="py-2.5 px-3 font-medium text-zinc-200">{it.description}</td>
                      <td className="py-2.5 px-3 text-center font-mono tabular-nums text-zinc-400">{it.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-zinc-400">${it.unitPrice}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-zinc-100">${it.lineTotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-3.5 bg-zinc-900/60 border-t border-zinc-800 flex flex-col items-end gap-1 text-xs">
                <div className="flex items-center justify-between w-48 text-zinc-400">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold tabular-nums text-zinc-200">${selectedInvoice.subtotal}</span>
                </div>
                {selectedInvoice.discount > 0 && (
                  <div className="flex items-center justify-between w-48 text-emerald-400">
                    <span>Discount:</span>
                    <span className="font-mono font-semibold tabular-nums">-${selectedInvoice.discount}</span>
                  </div>
                )}
                <div className="flex items-center justify-between w-48 text-sm font-extrabold text-zinc-100 pt-1 border-t border-zinc-800">
                  <span>Total Due:</span>
                  <span className="font-mono tabular-nums text-blue-400">${selectedInvoice.totalAmount}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BillingTable;
