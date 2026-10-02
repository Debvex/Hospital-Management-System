import { randomUUID } from 'node:crypto';
import { HttpError, requireFields } from '../lib/errors.js';
import { createAuditLog } from '../models/auditModel.js';
import { createInvoice, listInvoices, markInvoicePaid, patientExists } from '../models/invoiceModel.js';

const statuses = ['unpaid', 'paid', 'overdue', 'refunded'];
const methods = ['cash', 'credit_card', 'upi', 'insurance'];

export async function list(req, res) {
  if (!['administrator', 'receptionist', 'patient'].includes(req.user.role)) {
    throw new HttpError(403, 'FORBIDDEN', 'You cannot view billing records.');
  }
  res.json(await listInvoices({ user: req.user, patientId: req.query.patientId }));
}

export async function create(req, res) {
  const body = req.body || {};
  requireFields(body, ['patientId', 'items', 'paymentStatus']);
  if (!Array.isArray(body.items) || body.items.length === 0 || !statuses.includes(body.paymentStatus)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'An invoice requires at least one valid line item and payment status.');
  }
  if (!(await patientExists(body.patientId))) throw new HttpError(400, 'INVALID_RELATION', 'Patient not found.');
  const items = body.items.map((item) => {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    if (!item.description || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new HttpError(400, 'VALIDATION_ERROR', 'Invoice items require a description, positive quantity, and non-negative price.');
    }
    return { id: item.id || randomUUID(), description: String(item.description).trim(), quantity, unitPrice };
  });
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discount = Number(body.discount || 0);
  if (!Number.isFinite(discount) || discount < 0 || discount > subtotal) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Discount must be between zero and the invoice subtotal.');
  }
  const method = body.paymentStatus === 'paid' ? (body.paymentMethod || 'cash') : null;
  if (method && !methods.includes(method)) throw new HttpError(400, 'VALIDATION_ERROR', 'Payment method is invalid.');
  const normalizedItems = items.map((item) => ({ ...item, lineTotal: item.quantity * item.unitPrice }));
  const created = await createInvoice({ body, items: normalizedItems, subtotal, discount, method });
  await createAuditLog({ user: req.user, action: 'CREATE_INVOICE', resourceType: 'invoice', resourceId: created.id,
    metadata: { invoiceNumber: created.invoiceNumber, total: subtotal - discount }, req });
  res.status(201).json(created.invoice);
}

export async function markPaid(req, res) {
  const method = req.body?.paymentMethod || 'cash';
  if (!methods.includes(method)) throw new HttpError(400, 'VALIDATION_ERROR', 'Payment method is invalid.');
  const invoice = await markInvoicePaid(req.params.invoiceId, method);
  if (!invoice) throw new HttpError(404, 'NOT_FOUND', 'Invoice not found.');
  await createAuditLog({ user: req.user, action: 'RECORD_PAYMENT', resourceType: 'invoice', resourceId: invoice.id,
    metadata: { paymentMethod: method, invoiceNumber: invoice.invoiceNumber }, req });
  res.json(invoice);
}