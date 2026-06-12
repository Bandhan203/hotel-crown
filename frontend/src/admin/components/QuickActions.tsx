import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdEventAvailable,
  MdPersonAdd,
  MdDesktopWindows,
  MdCalendarMonth,
  MdBookOnline,
  MdPeople,
  MdCleaningServices,
  MdNightsStay,
  MdBarChart,
  MdLogin,
  MdLogout,
  MdHotel,
} from 'react-icons/md';

type QuickAction = {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'blue';
};

export default function QuickActions() {
  const navigate = useNavigate();

  const go = (path: string) => () => navigate(path);
  const frontDesk = (action?: string) => () => {
    navigate(action ? `/admin/front-desk?action=${action}` : '/admin/front-desk');
  };

  const actions: QuickAction[] = [
    {
      label: 'New Reservation',
      icon: <MdEventAvailable size={18} />,
      onClick: frontDesk('reservation'),
      variant: 'primary',
    },
    {
      label: 'Walk-in Check-in',
      icon: <MdPersonAdd size={18} />,
      onClick: frontDesk('walkin'),
      variant: 'blue',
    },
    {
      label: 'Front Desk',
      icon: <MdDesktopWindows size={18} />,
      onClick: frontDesk(),
      variant: 'secondary',
    },
    {
      label: 'Check-in',
      icon: <MdLogin size={18} />,
      onClick: go('/admin/front-desk?tab=arrivals'),
      variant: 'secondary',
    },
    {
      label: 'Check-out',
      icon: <MdLogout size={18} />,
      onClick: go('/admin/front-desk?tab=departures'),
      variant: 'secondary',
    },
    {
      label: 'Calendar',
      icon: <MdCalendarMonth size={18} />,
      onClick: go('/admin/reservations/calendar'),
      variant: 'secondary',
    },
    {
      label: 'Bookings',
      icon: <MdBookOnline size={18} />,
      onClick: go('/admin/bookings'),
      variant: 'secondary',
    },
    {
      label: 'Guests',
      icon: <MdPeople size={18} />,
      onClick: go('/admin/guests'),
      variant: 'secondary',
    },
    {
      label: 'Rooms',
      icon: <MdHotel size={18} />,
      onClick: go('/admin/rooms'),
      variant: 'secondary',
    },
    {
      label: 'Housekeeping',
      icon: <MdCleaningServices size={18} />,
      onClick: go('/admin/housekeeping'),
      variant: 'secondary',
    },
    {
      label: 'Night Audit',
      icon: <MdNightsStay size={18} />,
      onClick: go('/admin/night-audit'),
      variant: 'secondary',
    },
    {
      label: 'Reports',
      icon: <MdBarChart size={18} />,
      onClick: go('/admin/reports'),
      variant: 'secondary',
    },
  ];

  const variantClass: Record<NonNullable<QuickAction['variant']>, string> = {
    primary: 'bg-[#aa8453] hover:bg-[#c49b63] text-white border-[#aa8453]',
    blue: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
    secondary: 'bg-white/5 hover:bg-white/10 text-gray-200 border-white/10 hover:border-[#aa8453]/40',
  };

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-3">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2 px-1">Quick Actions</p>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors shrink-0 ${
              variantClass[action.variant || 'secondary']
            }`}
          >
            {action.icon}
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
