import { useEffect, useState } from 'react';
import { MdHotel, MdBookOnline, MdPeople, MdAttachMoney, MdLogout as MdCheckout, MdLogin, MdHome } from 'react-icons/md';
import { TbCurrencyTaka } from 'react-icons/tb';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import api from '../../services/api';
import StatsCard from '../components/StatsCard';
import QuickActions from '../components/QuickActions';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

interface DashboardData {
  total_rooms: number;
  occupied_rooms: number;
  occupancy_rate: number;
  bookings_today: number;
  revenue_month: number;
  total_guests: number;
  pending_checkouts_today: number;
  arrivals_today: number;
  departures_today: number;
  in_house_count: number;
  room_status: { clean: number; dirty: number; inspected: number; out_of_order: number };
  recent_bookings: {
    id: number; booking_ref: string; guest_name: string; room_type: string;
    check_in: string; check_out: string; status: string; total_price: number;
  }[];
  revenue_chart: { date: string; revenue: number }[];
}

const statusColor: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  CONFIRMED: 'bg-blue-500/20 text-blue-400',
  CHECKED_IN: 'bg-green-500/20 text-green-400',
  CHECKED_OUT: 'bg-gray-500/20 text-gray-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/admin/')
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#aa8453] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return <p className="text-gray-400">Failed to load dashboard data.</p>;

  const revenueChartData = {
    labels: data.revenue_chart.map((d) => new Date(d.date).toLocaleDateString('en', { weekday: 'short' })),
    datasets: [{
      label: 'Revenue ($)',
      data: data.revenue_chart.map((d) => d.revenue),
      borderColor: '#aa8453',
      backgroundColor: 'rgba(170,132,83,0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#aa8453',
    }],
  };

  const occupancyData = {
    labels: ['Occupied', 'Available'],
    datasets: [{
      data: [data.occupied_rooms, data.total_rooms - data.occupied_rooms],
      backgroundColor: ['#aa8453', '#2a2a2a'],
      borderWidth: 0,
    }],
  };

  return (
    <div className="space-y-6">
      <QuickActions />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Total Rooms" value={data.total_rooms} icon={<MdHotel size={22} />} />
        <StatsCard title="Occupancy Rate" value={`${data.occupancy_rate}%`} icon={<MdHotel size={22} />} color="#3b82f6" />
        <StatsCard title="Bookings Today" value={data.bookings_today} icon={<MdBookOnline size={22} />} color="#22c55e" />
        <StatsCard title="Monthly Revenue" value={data.revenue_month.toLocaleString()} icon={<TbCurrencyTaka size={24} />} color="#f59e0b" valueClassName="text-lg xl:text-xl" />
        <StatsCard title="Total Guests" value={data.total_guests} icon={<MdPeople size={22} />} color="#8b5cf6" />
      </div>

      {/* Front Desk Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Arrivals Today" value={data.arrivals_today} icon={<MdLogin size={22} />} color="#22c55e" />
        <StatsCard title="Departures Today" value={data.departures_today} icon={<MdCheckout size={22} />} color="#f59e0b" />
        <StatsCard title="In-House Guests" value={data.in_house_count} icon={<MdHome size={22} />} color="#3b82f6" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Revenue (Last 7 Days)</h3>
          <Line
            data={revenueChartData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { ticks: { color: '#6b7280' }, grid: { display: false } },
              },
            }}
          />
        </div>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 flex flex-col items-center">
          <h3 className="text-white font-semibold mb-4 self-start">Room Occupancy</h3>
          <div className="w-48 h-48">
            <Doughnut
              data={occupancyData}
              options={{
                responsive: true, maintainAspectRatio: false,
                cutout: '70%',
                plugins: { legend: { display: false } },
              }}
            />
          </div>
          <div className="mt-4 text-center">
            <p className="text-3xl font-bold text-[#aa8453]">{data.occupancy_rate}%</p>
            <p className="text-xs text-gray-400">{data.occupied_rooms} of {data.total_rooms} rooms</p>
          </div>
        </div>
      </div>

      {/* Pending Checkouts alert */}
      {data.pending_checkouts_today > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-center gap-3">
          <MdCheckout size={24} className="text-orange-400" />
          <p className="text-orange-300 text-sm font-medium">
            {data.pending_checkouts_today} checkout{data.pending_checkouts_today > 1 ? 's' : ''} pending today
          </p>
        </div>
      )}

      {/* Recent Bookings Table */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h3 className="text-white font-semibold">Recent Bookings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr className="text-gray-400 text-left">
                <th className="px-5 py-3 font-medium">Ref</th>
                <th className="px-5 py-3 font-medium">Guest</th>
                <th className="px-5 py-3 font-medium">Room Type</th>
                <th className="px-5 py-3 font-medium">Check-in</th>
                <th className="px-5 py-3 font-medium">Check-out</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.recent_bookings.map((b) => (
                <tr key={b.id} className="text-gray-300 hover:bg-white/5">
                  <td className="px-5 py-3 font-mono text-xs text-[#aa8453]">{b.booking_ref}</td>
                  <td className="px-5 py-3">{b.guest_name}</td>
                  <td className="px-5 py-3">{b.room_type}</td>
                  <td className="px-5 py-3">{b.check_in}</td>
                  <td className="px-5 py-3">{b.check_out}</td>
                  <td className="px-5 py-3">BDT {b.total_price}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[b.status] || ''}`}>
                      {b.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
              {data.recent_bookings.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-500">No bookings yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
