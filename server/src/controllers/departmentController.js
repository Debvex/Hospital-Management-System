import { listActiveDepartments } from '../models/departmentModel.js';

export async function list(_req, res) {
  res.json(await listActiveDepartments());
}

