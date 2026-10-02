import { randomUUID } from 'node:crypto';
import { pool } from '../db/client.js';
import { mapInvoice, invoiceSelect } from './mappers.js';

export async function listInvoices({ user, patientId }) {
  const params = [];
  let where = '';
  if (user.role === 'patient') {
    if (!user.patientId) return [];
    params.push(user.patientId);
    where = ' WHERE i.patient_id = $1';
  }
  if (patientId && user.role !== 'patient') {
    params.push(patientId);
    where += `${where ? ' AND' : ' WHERE'} i.patient_id = $${params.length}`;
  }
  const result = await pool.query(`${invoiceSelect}${where} ORDER BY i.created_at DESC`, params);
  return result.rows.map(mapInvoice);
}

export async function patientExists(patientId) {
  const result = await pool.query('SELECT 1 FROM patients WHERE id = $1', [patientId]);
  return result.rowCount > 0;
}

export async function createInvoice({ body, items, subtotal, discount, method }) {
  const seq = await pool.query("SELECT nextval('invoice_number_sequence') AS seq");
  const id = randomUUID();
  const invoiceNumber = `INV-${new Date().getFullYear()}-${seq.rows[0].seq}`;
  await pool.query(
    `INSERT INTO invoices (
      id, invoice_number, appointment_id, patient_id, subtotal, additional_charges, discount,
      total_amount, payment_status, payment_method, paid_at, due_date, items
    ) VALUES ($1, $2, $3, $4, $5, 0, $6, $7, $8, $9, CASE WHEN $8 = 'paid' THEN NOW() ELSE NULL END, CURRENT_DATE + 7, $10::jsonb)`,
    [id, invoiceNumber, body.appointmentId || null, body.patientId, subtotal, discount,
      Math.max(0, subtotal - discount), body.paymentStatus, method, JSON.stringify(items)],
  );
  const result = await pool.query(`${invoiceSelect} WHERE i.id = $1`, [id]);
  return { invoice: mapInvoice(result.rows[0]), id, invoiceNumber };
}

export async function markInvoicePaid(id, method) {
  const result = await pool.query(
    `UPDATE invoices SET payment_status = 'paid', payment_method = $1, paid_at = NOW()
     WHERE id = $2 RETURNING id`, [method, id],
  );
  if (!result.rowCount) return null;
  const invoice = await pool.query(`${invoiceSelect} WHERE i.id = $1`, [id]);
  return mapInvoice(invoice.rows[0]);
}