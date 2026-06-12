import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PageHero from '../components/PageHero';
import SectionHeading from '../components/SectionHeading';
import api from '../services/api';
import { hotelImages } from '../constants/images';
import { CROWN_ROOMS } from '../constants/rooms';
import { toMediaUrl } from '../utils/mediaUrl';

type ApiRoom = {
  id: number;
  name: string;
  slug?: string;
  max_guests: number;
  beds?: number;
  size?: number;
  price_per_night?: number;
  primary_image?: string | null;
  images?: { image: string }[];
};

export default function Rooms() {
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadRooms(): Promise<void> {
      try {
        setLoading(true);
        const res = await api.get<{ results?: ApiRoom[] } | ApiRoom[]>('/rooms/');
        const data = Array.isArray(res.data) ? res.data : res.data.results ?? [];
        if (mounted && data.length > 0) {
          setRooms(data);
          setUsingFallback(false);
        } else if (mounted) {
          setUsingFallback(true);
        }
      } catch {
        if (mounted) {
          setUsingFallback(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadRooms();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <PageHero
        title="Rooms & Suites"
        breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Rooms & Suites' }]}
        backgroundImage={hotelImages.roomPageHero}
      />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading subtitle="HOTEL CROWN" title="Rooms & Suites" />

          {loading && <p className="text-body text-center mb-8">Loading rooms...</p>}

          {usingFallback ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {CROWN_ROOMS.map((room) => (
                <div key={room.id} className="group bg-[var(--color-light)]">
                  <div className="relative overflow-hidden">
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-full h-[300px] object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-[var(--color-dark)] text-white px-3 py-1 text-xs font-[var(--font-condensed)] uppercase tracking-wider">
                      {room.max_guests} Pax
                    </div>
                    <div className="absolute top-4 right-4 bg-[var(--color-primary)] text-white px-4 py-1 text-sm font-[var(--font-condensed)]">
                      BDT {room.price_bdt.toLocaleString()} / USD {room.price_usd}
                    </div>
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-[var(--font-heading)] text-[var(--color-dark)] mb-3">
                      {room.name}
                    </h3>
                    <p className="text-sm text-[var(--color-body)] leading-relaxed mb-4 line-clamp-4">
                      {room.description}
                    </p>
                    <div className="flex justify-center gap-3">
                      <Link
                        to={`/room-details/${room.slug}`}
                        className="btn-primary text-xs !py-2 !px-5"
                      >
                        DETAILS
                      </Link>
                      <Link
                        to={`/room-details/${room.slug}`}
                        className="btn-primary text-xs !py-2 !px-5 !bg-[var(--color-primary)] !text-white hover:!bg-[var(--color-primary-dark)]"
                      >
                        BOOK
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rooms.map((room) => (
                <div key={room.id} className="group bg-[var(--color-light)]">
                  <div className="relative overflow-hidden">
                    <img
                      src={toMediaUrl(room.primary_image || room.images?.[0]?.image, hotelImages.default)}
                      alt={room.name}
                      className="w-full h-[300px] object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {room.price_per_night != null && (
                      <div className="absolute top-4 right-4 bg-[var(--color-primary)] text-white px-4 py-1 text-sm font-[var(--font-condensed)]">
                        BDT {Number(room.price_per_night).toLocaleString()} / NIGHT
                      </div>
                    )}
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-[var(--font-heading)] text-[var(--color-dark)] mb-3">
                      {room.name}
                    </h3>
                    <div className="flex items-center justify-center gap-4 text-[var(--color-body)] text-xs mb-4">
                      <span>👤 {room.max_guests}</span>
                      {room.beds != null && <span>🛏️ {room.beds} Bed</span>}
                      {room.size != null && <span>📐 {room.size} m²</span>}
                    </div>
                    <div className="flex justify-center gap-3">
                      <Link
                        to={`/room-details/${room.slug || room.id}`}
                        className="btn-primary text-xs !py-2 !px-5"
                      >
                        DETAILS
                      </Link>
                      <Link
                        to={`/room-details/${room.slug || room.id}`}
                        className="btn-primary text-xs !py-2 !px-5 !bg-[var(--color-primary)] !text-white hover:!bg-[var(--color-primary-dark)]"
                      >
                        BOOK
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
