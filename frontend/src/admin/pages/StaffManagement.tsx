import { useCallback, useMemo, useState } from 'react';
import { type ColDef, type ICellRendererParams } from 'ag-grid-community';
import { MdAdd, MdDelete } from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../../services/api';
import AdminDataGrid from '../components/AdminDataGrid';
import { ACTIVE_BADGE, BADGE, deleteBtn, goldBtn, pinCol } from '../utils/gridHelpers';

interface StaffProfile {
  id: number; email: string; full_name: string; phone: string;
  department: string; position: string; hire_date: string; is_active: boolean;
  permissions: { id: number; module: string; can_view: boolean; can_create: boolean; can_edit: boolean; can_delete: boolean }[];
}

const MODULES = ['ROOMS', 'BOOKINGS', 'GUESTS', 'RESTAURANT', 'SPA', 'CMS', 'STAFF'];

export default function StaffManagement() {
  const [showForm, setShowForm] = useState(false);
  const [showPerms, setShowPerms] = useState<StaffProfile | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const bumpRefresh = () => setRefreshKey(k => k + 1);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('Delete this staff member?')) return;
    try {
      await api.delete(`/admin/staff/${id}/`);
      toast.success('Staff deleted');
      bumpRefresh();
    } catch {
      toast.error('Failed to delete');
    }
  }, []);

  const columns = useMemo<ColDef[]>(() => [
    { field: 'full_name', headerName: 'Name', width: 140, minWidth: 140, maxWidth: 140, pinned: 'left', lockPinned: true, cellClass: 'cell-guest cell-pin cell-ellipsis', tooltipField: 'full_name', ...pinCol },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 180, cellClass: 'cell-ellipsis', tooltipField: 'email' },
    { field: 'department', headerName: 'Department', width: 120 },
    { field: 'position', headerName: 'Position', width: 120 },
    { field: 'phone', headerName: 'Mobile', width: 118, valueFormatter: p => p.value || '—' },
    {
      field: 'is_active', headerName: 'Status', width: 90, cellClass: '',
      cellRenderer: (p: ICellRendererParams) => (
        <span className={`${BADGE} ${ACTIVE_BADGE[String(p.value)] || 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
          {p.value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      headerName: 'Actions', width: 120, minWidth: 120, maxWidth: 120,
      pinned: 'right', lockPinned: true, sortable: false, filter: false,
      cellClass: 'cell-pin cell-actions', ...pinCol,
      cellRenderer: (p: ICellRendererParams) => (
        <div className="flex items-center gap-1 h-full">
          <button type="button" title="Permissions" onClick={() => setShowPerms(p.data)}
            className={goldBtn}>
            Perms
          </button>
          <button type="button" title="Delete" onClick={() => handleDelete(p.data.id)} className={deleteBtn}>
            <MdDelete size={12} />
          </button>
        </div>
      ),
    },
  ], [handleDelete]);

  const handleCreateStaff = async (data: any) => {
    try {
      await api.post('/admin/staff/', data);
      toast.success('Staff created');
      setShowForm(false);
      bumpRefresh();
    } catch (err: any) {
      const detail = err.response?.data;
      if (detail && typeof detail === 'object') {
        toast.error(Object.entries(detail).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n'));
      } else {
        toast.error('Failed to create staff');
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#aa8453] text-white rounded-md text-xs font-medium hover:bg-[#c49b63] transition shrink-0"
          >
            <MdAdd size={16} /> Add Staff
          </button>
        </div>
      </div>

      <AdminDataGrid url="/admin/staff/" columnDefs={columns} pageSize={15} refreshKey={refreshKey} rowLabel="staff member" />

      {showForm && <CreateStaffModal onClose={() => setShowForm(false)} onSave={handleCreateStaff} />}

      {showPerms && (
        <PermissionsModal
          staff={showPerms}
          onClose={() => { setShowPerms(null); bumpRefresh(); }}
        />
      )}
    </div>
  );
}

function CreateStaffModal({ onClose, onSave }: { onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({ email: '', full_name: '', phone: '', password: '', department: '', position: '' });
  const set = (k: string, v: string) => setForm({ ...form, [k]: v });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-white mb-4">Add Staff Member</h2>
        <div className="space-y-4">
          {[['email', 'Email', 'email'], ['full_name', 'Full Name', 'text'], ['phone', 'Phone', 'text'],
            ['password', 'Password', 'password'], ['department', 'Department', 'text'], ['position', 'Position', 'text']
          ].map(([key, label, type]) => (
            <div key={key}>
              <label className="block text-sm text-gray-300 mb-1">{label}</label>
              <input type={type} value={(form as any)[key]} onChange={e => set(key, e.target.value)}
                className="w-full px-3 py-2 bg-[#0f0f0f] border border-white/10 rounded-lg text-white text-sm focus:border-[#aa8453] outline-none" />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancel</button>
          <button onClick={() => onSave(form)} className="px-4 py-2 bg-[#aa8453] hover:bg-[#c49b63] text-white rounded-lg text-sm font-medium">Create</button>
        </div>
      </div>
    </div>
  );
}

function PermissionsModal({ staff, onClose }: { staff: StaffProfile; onClose: () => void }) {
  const [perms, setPerms] = useState<Record<string, { can_view: boolean; can_create: boolean; can_edit: boolean; can_delete: boolean }>>(
    () => {
      const map: any = {};
      MODULES.forEach(m => {
        const existing = staff.permissions.find(p => p.module === m);
        map[m] = existing
          ? { can_view: existing.can_view, can_create: existing.can_create, can_edit: existing.can_edit, can_delete: existing.can_delete }
          : { can_view: false, can_create: false, can_edit: false, can_delete: false };
      });
      return map;
    }
  );
  const [saving, setSaving] = useState(false);

  const toggle = (module: string, perm: string) => {
    setPerms(prev => ({ ...prev, [module]: { ...prev[module], [perm]: !prev[module][perm as keyof typeof prev[typeof module]] } }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = Object.entries(perms).map(([module, p]) => ({ module, ...p }));
      await api.put(`/admin/staff/${staff.id}/permissions/`, payload);
      toast.success('Permissions updated');
      onClose();
    } catch {
      toast.error('Failed to update permissions');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-white mb-1">Permissions — {staff.full_name}</h2>
        <p className="text-sm text-gray-400 mb-4">{staff.email}</p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-left border-b border-white/10">
                <th className="py-2 pr-4">Module</th>
                <th className="py-2 px-3 text-center">View</th>
                <th className="py-2 px-3 text-center">Create</th>
                <th className="py-2 px-3 text-center">Edit</th>
                <th className="py-2 px-3 text-center">Delete</th>
              </tr>
            </thead>
            <tbody>
              {MODULES.map(m => (
                <tr key={m} className="border-b border-white/5">
                  <td className="py-2 pr-4 text-white font-medium">{m}</td>
                  {(['can_view', 'can_create', 'can_edit', 'can_delete'] as const).map(p => (
                    <td key={p} className="py-2 px-3 text-center">
                      <input type="checkbox" checked={perms[m][p]} onChange={() => toggle(m, p)}
                        className="w-4 h-4 rounded border-white/10 bg-[#0f0f0f] text-[#aa8453] focus:ring-[#aa8453]" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancel</button>
          <button onClick={save} disabled={saving}
            className="px-4 py-2 bg-[#aa8453] hover:bg-[#c49b63] disabled:opacity-50 text-white rounded-lg text-sm font-medium">
            {saving ? 'Saving...' : 'Save Permissions'}
          </button>
        </div>
      </div>
    </div>
  );
}
