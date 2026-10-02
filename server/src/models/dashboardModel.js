import { pool } from '../db/client.js';

export async function getDashboardSummary(user) {
  const today = await pool.query(
    `SELECT COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'scheduled')::int AS pending
     FROM appointments WHERE appointment_date = CURRENT_DATE
     AND ($1::text IS NULL OR patient_id = $1)
     AND ($2::text IS NULL OR doctor_id = $2)`,
    [user.role === 'patient' ? user.patientId || null : null, user.role === 'doctor' ? user.doctorId || null : null],
  );
  const counts = await pool.query(
    `SELECT (SELECT COUNT(*)::int FROM patients) AS patients,
      (SELECT COUNT(*)::int FROM doctors WHERE is_active) AS doctors,
      (SELECT COUNT(*)::int FROM invoices WHERE payment_status = 'unpaid'
        AND ($1::text IS NULL OR patient_id = $1)) AS unpaid,
      (SELECT COALESCE(SUM(total_amount), 0)::numeric FROM invoices
        WHERE payment_status = 'paid' AND paid_at::date = CURRENT_DATE
        AND ($1::text IS NULL OR patient_id = $1)) AS revenue`,
    [user.role === 'patient' ? user.patientId || null : null],
  );
  const summary = counts.rows[0];
  return {
    totalAppointmentsToday: today.rows[0].total,
    pendingConsultations: today.rows[0].pending,
    totalActivePatients: ['administrator', 'receptionist'].includes(user.role) ? summary.patients : (user.role === 'patient' ? 1 : summary.patients),
    availableDoctorsCount: summary.doctors,
    totalRevenueToday: Number(summary.revenue || 0),
    unpaidInvoicesCount: summary.unpaid,
  };
}