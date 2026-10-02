import { HttpError } from '../lib/errors.js';
import {
  listPendingRegistrationRequests,
  reviewRegistrationRequest,
} from '../models/registrationrequestModel.js';
import { createAuditLog } from '../models/auditModel.js';
import { createDepartment, listDepartments, setDepartmentActive } from '../models/departmentModel.js';
import { countActiveAdministrators, listUsers, setUserActive } from '../models/userModel.js';
import { mapUser } from '../models/mappers.js';

export async function listRegistrationRequests(_req, res) {
  res.json(await listPendingRegistrationRequests());
}



export async function reviewRegistration(req, res) {
  const decision = req.body?.decision;
  if (!['approved', 'rejected'].includes(decision)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Decision must be approved or rejected.');
  }
  try {
    const result = await reviewRegistrationRequest({
      requestId: req.params.requestId,
      decision,
      reviewer: req.user,
      req,
    });
    if (!result) throw new HttpError(404, 'NOT_FOUND', 'Pending registration request not found.');
    res.json(result);
  } catch (error) {
    if (error.code === '23505') {
      throw new HttpError(409, 'CONFLICT_EMAIL_EXISTS', 'An account already exists for this email address.');
    }
    throw error;
  }
}

export async function listStaff(_req, res) {
  const users = await listUsers();
  res.json(users.map(mapUser));
}

export async function updateStaffStatus(req, res) {
  const { isActive } = req.body || {};
  if (typeof isActive !== 'boolean') throw new HttpError(400, 'VALIDATION_ERROR', 'isActive must be a boolean.');
  if (req.params.userId === req.user.id && !isActive) {
    throw new HttpError(400, 'CANNOT_DEACTIVATE_SELF', 'You cannot deactivate your own administrator account.');
  }
  const users = await listUsers();
  const target = users.find((user) => user.id === req.params.userId);
  if (!target) throw new HttpError(404, 'NOT_FOUND', 'User not found.');
  if (target.role === 'administrator' && !isActive && target.is_active && (await countActiveAdministrators()) <= 1) {
    throw new HttpError(409, 'LAST_ADMINISTRATOR', 'At least one active administrator account must remain.');
  }
  const updated = await setUserActive(target.id, isActive);
  await createAuditLog({ user: req.user, action: isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
    resourceType: 'auth', resourceId: target.id, metadata: { role: target.role }, req });
  res.json(mapUser(updated));
}

export async function departments(_req, res) {
  res.json(await listDepartments());
}

export async function createDepartmentHandler(req, res) {
  const { name, code } = req.body || {};
  if (typeof name !== 'string' || !name.trim() || typeof code !== 'string' || !/^[A-Za-z0-9_-]{2,12}$/.test(code.trim())) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Department name and a 2-12 character code are required.');
  }
  try {
    const department = await createDepartment(req.body);
    await createAuditLog({ user: req.user, action: 'CREATE_DEPARTMENT', resourceType: 'department', resourceId: department.id, metadata: { name: department.name, code: department.code }, req });
    res.status(201).json(department);
  } catch (error) {
    if (error.code === '23505') throw new HttpError(409, 'DEPARTMENT_EXISTS', 'Department name or code already exists.');
    throw error;
  }
}

export async function updateDepartmentStatus(req, res) {
  const { isActive } = req.body || {};
  if (typeof isActive !== 'boolean') throw new HttpError(400, 'VALIDATION_ERROR', 'isActive must be a boolean.');
  const department = await setDepartmentActive(req.params.departmentId, isActive);
  if (!department) throw new HttpError(404, 'NOT_FOUND', 'Department not found.');
  await createAuditLog({ user: req.user, action: isActive ? 'ACTIVATE_DEPARTMENT' : 'DEACTIVATE_DEPARTMENT',
    resourceType: 'department', resourceId: department.id, metadata: { name: department.name }, req });
  res.json(department);
}