import { randomUUID } from 'node:crypto';
import { pool } from '../db/client.js';

function mapDepartment(row) {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description,
    headOfDepartment: row.head_of_department,
    roomFloor: row.room_floor,
    isActive: row.is_active,
  };
}

export async function listDepartments() {
  const result = await pool.query('SELECT * FROM departments ORDER BY name');
  return result.rows.map(mapDepartment);
}

export async function createDepartment(data) {
  const result = await pool.query(
    `INSERT INTO departments (id, name, code, description, head_of_department, room_floor)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [randomUUID(), data.name.trim(), data.code.trim().toUpperCase(), data.description?.trim() || '',
      data.headOfDepartment?.trim() || '', data.roomFloor?.trim() || ''],
  );
  return mapDepartment(result.rows[0]);
}

export async function setDepartmentActive(id, isActive) {
  const result = await pool.query(
    'UPDATE departments SET is_active = $1 WHERE id = $2 RETURNING *', [isActive, id],
  );
  return result.rows[0] ? mapDepartment(result.rows[0]) : null;
}

export async function listActiveDepartments() {
  const result = await pool.query('SELECT * FROM departments WHERE is_active = TRUE ORDER BY name');
  return result.rows.map(mapDepartment);
}