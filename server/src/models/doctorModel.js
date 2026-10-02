import { pool } from '../db/client.js';
import { mapDoctor } from './mappers.js';

export async function listDoctors(departmentId) {
  const params = [];
  let where = 'WHERE d.is_active = TRUE AND u.is_active = TRUE AND dep.is_active = TRUE';
  if (departmentId) {
    params.push(departmentId);
    where += ' AND d.department_id = $1';
  }
  const result = await pool.query(
    `SELECT d.*, dep.name AS department_name FROM doctors d
     JOIN departments dep ON dep.id = d.department_id
     JOIN users u ON u.id = d.user_id ${where} ORDER BY d.full_name`, params,
  );
  return result.rows.map(mapDoctor);
}

export async function findDoctorById(id) {
  const result = await pool.query(
    `SELECT d.*, dep.name AS department_name FROM doctors d
     JOIN departments dep ON dep.id = d.department_id
     JOIN users u ON u.id = d.user_id
     WHERE d.id = $1 AND d.is_active AND u.is_active AND dep.is_active`, [id],
  );
  return result.rows[0] ? mapDoctor(result.rows[0]) : null;
}