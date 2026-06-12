import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MdAdd, MdBlock, MdReceipt } from 'react-icons/md';
import api from '../../services/api';

interface FolioCharge {
  id: number;
  charge_type: string;
  description: string;
  amount: string;
  quantity: number;
  total: string;
  charge_date: string;
  posted_by_name: string | null;
  reference: string;
  is_void: boolean;
}

interface FolioSummary {
  room_charges: number;
  folio_total: number;
  payments_total: number;
  balance: number;
}

interface Props {
  bookingId: number;
  bookingRef: string;
  onClose: () => void;
}

const chargeTypeLabels: Record<string, string> = {
  ROOM: 'Room',
  FOOD: 'Food & Bev',
  BEVERAGE: 'Beverage',
  PHONE: 'Phone',
  LAUNDRY: 'Laundry',
  MINIBAR: 'Minibar',
  SPA: 'Spa',
  SERVICE: 'Service',
  TAX: 'Tax',
  DISCOUNT: 'Discount',
  DEPOSIT: 'Deposit',
  REFUND: 'Refund',
};

export default function GuestFolio({ bookingId, bookingRef, onClose }: Props) {
  const [charges, setCharges] = useState<FolioCharge[]>([]);
  const [summary, setSummary] = useState<FolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    charge_type: 'SERVICE',
    description: '',
    amount: '',
    quantity: '1',
    charge_date: new Date().toISOString().split('T')[0],
    reference: '',
  });
  const [posting, setPosting] = useState(false);

  const fetchFolio = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/bookings/${bookingId}/folio/`);
      setCharges(res.data.charges || []);
      setSummary(res.data.summary || null);
    } catch {
      toast.error('Failed to load folio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFolio(); }, [bookingId]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount) {
      toast.error('Description and amount are required');
      return;
    }
    setPosting(true);
    try {
      await api.post(`/admin/bookings/${bookingId}/folio/`, {
        charge_type: form.charge_type,
        description: form.description,
        amount: parseFloat(form.amount),
        quantity: Number(form.quantity),
        charge_date: form.charge_date,
        reference: form.reference,
      });
      toast.success('Charge posted');
      setShowForm(false);
      setForm({ charge_type: 'SERVICE', description: '', amount: '', quantity: '1', charge_date: new Date().toISOString().split('T')[0], reference: '' });
      fetchFolio();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to post charge');
    } finally {
      setPosting(false);
    }
  };

  const handleVoid = async (chargeId: number) => {
    if (!window.confirm('Void this charge?')) return;
    try {
      await api.patch(`/admin/folio/${chargeId}/void/`);
      toast.success('Charge voided');
      fetchFolio();
    } catch {
      toast.error('Failed to void charge');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 sticky top-0 bg-[#1a1a1a] z-10">
          <div className="flex items-center gap-3">
            <MdReceipt size={24} className="text-[#aa8453]" />
            <div>
              <h2 className="text-lg font-bold text-white">Guest Folio</h2>
              <p className="text-xs text-gray-400">{bookingRef}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#aa8453] rounded-lg text-white text-xs hover:bg-[#8a6a3f] transition"
            >
              <MdAdd size={16} /> Post Charge
            </button>
            <button onClick={onClose} className="px-3 py-1.5 border border-white/10 rounded-lg text-gray-300 text-xs hover:bg-white/5 transition">
              Close
            </button>
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="mx-5 mt-4 grid grid-cols-4 gap-3">
            {[
              { label: 'Room Charges', value: summary.room_charges, color: 'text-white' },
              { label: 'Extra Charges', value: summary.folio_total, color: 'text-white' },
              { label: 'Payments', value: summary.payments_total, color: 'text-green-400' },
              { label: 'Balance', value: summary.balance, color: summary.balance > 0 ? 'text-red-400' : 'text-green-400' },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{item.label}</p>
                <p className={`text-lg font-bold ${item.color}`}> BDT {item.value.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Post charge form */}
        {showForm && (
          <form onSubmit={handlePost} className="mx-5 mt-4 bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Type</label>
                <select
                  value={form.charge_type}
                  onChange={e => setForm(f => ({ ...f, charge_type: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-[#aa8453]"
                >
                  {Object.entries(chargeTypeLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Description *</label>
                <input
                  type="text" required
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-[#aa8453]"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Amount *</label>
                <input
                  type="number" step="0.01" required
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-[#aa8453]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Qty</label>
                <input
                  type="number" min="1"
                  value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-[#aa8453]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Date</label>
                <input
                  type="date"
                  value={form.charge_date}
                  onChange={e => setForm(f => ({ ...f, charge_date: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-[#aa8453]"
                />
              </div>
              <div className="flex items-end">
                <button type="submit" disabled={posting} className="w-full py-1.5 bg-[#aa8453] rounded text-white text-xs font-medium hover:bg-[#8a6a3f] transition disabled:opacity-50">
                  {posting ? '...' : 'Post'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Charges list */}
        <div className="p-5">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-4 border-[#aa8453] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : charges.length === 0 ? (
            <p className="text-center text-gray-500 py-10 text-sm">No folio charges yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500 border-b border-white/10">
                    <th className="text-left py-2 px-2 font-medium">Date</th>
                    <th className="text-left py-2 px-2 font-medium">Type</th>
                    <th className="text-left py-2 px-2 font-medium">Description</th>
                    <th className="text-right py-2 px-2 font-medium">Amount</th>
                    <th className="text-right py-2 px-2 font-medium">Qty</th>
                    <th className="text-right py-2 px-2 font-medium">Total</th>
                    <th className="text-center py-2 px-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {charges.map(c => (
                    <tr key={c.id} className={`${c.is_void ? 'opacity-40 line-through' : ''} text-gray-300`}>
                      <td className="py-2 px-2">{c.charge_date}</td>
                      <td className="py-2 px-2">{chargeTypeLabels[c.charge_type] || c.charge_type}</td>
                      <td className="py-2 px-2">{c.description}</td>
                      <td className="py-2 px-2 text-right">BDT {c.amount}</td>
                      <td className="py-2 px-2 text-right">{c.quantity}</td>
                      <td className="py-2 px-2 text-right font-medium">BDT {c.total}</td>
                      <td className="py-2 px-2 text-center">
                        {!c.is_void && (
                          <button
                            onClick={() => handleVoid(c.id)}
                            className="text-red-400 hover:text-red-300"
                            title="Void"
                          >
                            <MdBlock size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
