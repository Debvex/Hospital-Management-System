import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { useToast } from '../ui/Toast';
import { api } from '../../lib/api';
import { Patient, Invoice, InvoiceItem, PaymentStatus } from '../../types';
import GoogleIconCircle from '../ui/GoogleIconCircle';
import { Plus, Trash2, Receipt, DollarSign } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (invoice: Invoice) => void;
  defaultPatientId?: string;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultPatientId,
}) => {
  const { success, error } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState(defaultPatientId || '');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: 'item-1', description: 'Specialist Doctor Consultation', quantity: 1, unitPrice: 150, lineTotal: 150 },
    { id: 'item-2', description: 'Clinical Diagnostics & Vitals Assessment', quantity: 1, unitPrice: 30, lineTotal: 30 },
  ]);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [paymentMethod, setPaymentMethod] = useState<Invoice['paymentMethod']>('credit_card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.patients.list().then((list) => {
        setPatients(list);
        if (!selectedPatientId && list.length > 0) {
          setSelectedPatientId(defaultPatientId || list[0].id);
        }
      });
    }
  }, [isOpen, defaultPatientId]);

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalAmount = Math.max(0, subtotal - (Number(discount) || 0));

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: 'Hospital Service / Medication',
        quantity: 1,
        unitPrice: 50,
        lineTotal: 50,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: 'description' | 'quantity' | 'unitPrice', val: any) => {
    setItems((prev) => {
      const copy = [...prev];
      const target = { ...copy[index], [field]: val };
      if (field === 'quantity' || field === 'unitPrice') {
        const q = Number(target.quantity) || 1;
        const p = Number(target.unitPrice) || 0;
        target.lineTotal = q * p;
      }
      copy[index] = target;
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      error('Validation Error', 'Please select a patient.');
      return;
    }
    if (items.length === 0) {
      error('Validation Error', 'Add at least one invoice item.');
      return;
    }

    setIsSubmitting(true);
    try {
      const inv = await api.invoices.create({
        patientId: selectedPatientId,
        items,
        discount: Number(discount) || 0,
        paymentStatus,
        paymentMethod: paymentStatus === 'paid' ? paymentMethod : undefined,
      });

      success('Invoice Generated', `Created ${inv.invoiceNumber} for ₹${inv.totalAmount}`);
      onSuccess(inv);
      onClose();
    } catch (err: any) {
      error('Invoice Creation Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Hospital Invoice"
      subtitle="Itemized billing breakdown, deductions, and payment status"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-zinc-100">
        {/* Patient Selection */}
        <Select
          label="Billed Patient"
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          required
        >
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.fullName} ({p.mrn})
            </option>
          ))}
        </Select>

        {/* Itemized Line Items */}
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GoogleIconCircle icon={Receipt} color="red" size="xs" />
              <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                Line Items & Clinical Charges
              </h4>
            </div>
            <button
              type="button"
              onClick={addItem}
              className="text-xs font-bold text-blue-200 bg-blue-900/60 hover:bg-blue-800 border border-blue-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-blue-200" />
              Add Charge
            </button>
          </div>

          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2.5 bg-[#181a20] rounded-xl border border-zinc-800"
              >
                <div className="flex-1">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateItem(idx, 'description', e.target.value)}
                  />
                </div>
                <div className="w-16">
                  <Input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                  />
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    min="0"
                    placeholder="Price (₹)"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(idx, 'unitPrice', Number(e.target.value))}
                  />
                </div>
                <div className="w-20 text-right font-mono font-bold text-xs text-zinc-100 tabular-nums">
                  ₹{item.lineTotal}
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-zinc-400 hover:text-rose-400" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Pricing calculations */}
          <div className="pt-3 border-t border-zinc-800 flex flex-col items-end gap-1.5 text-xs text-zinc-400">
            <div className="flex items-center gap-4">
              <span>Subtotal:</span>
              <span className="font-mono font-bold text-zinc-200 tabular-nums">₹{subtotal}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Discount / Waiver (₹):</span>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-20 text-right font-mono font-semibold rounded-lg border border-zinc-700 bg-[#181a20] text-zinc-100 px-2 py-0.5"
              />
            </div>
            <div className="flex items-center gap-4 text-sm font-extrabold text-zinc-100 pt-1 border-t border-zinc-800">
              <span>Total Payable:</span>
              <span className="font-mono tabular-nums text-base text-blue-400">
                ₹{totalAmount}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Status & Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Payment Status"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
          >
            <option value="unpaid">Unpaid (Awaiting Payment)</option>
            <option value="paid">Paid (Mark Received)</option>
          </Select>

          {paymentStatus === 'paid' && (
            <Select
              label="Payment Channel"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as Invoice['paymentMethod'])}
            >
              <option value="cash">Cash Desk</option>
              <option value="credit_card">Credit / Debit Card</option>
              <option value="upi">UPI / Instant Transfer</option>
              <option value="insurance">Insurance Claim</option>
            </Select>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="google" isLoading={isSubmitting}>
            Generate Invoice
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default InvoiceModal;
