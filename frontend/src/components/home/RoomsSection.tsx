import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import SectionHeading from '../SectionHeading';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import api from '../../services/api';
import { CROWN_ROOMS } from '../../constants/rooms';
import { hotelImages } from '../../constants/images';
import { toMediaUrl } from '../../utils/mediaUrl';
import { unwrapList } from '../../utils/cmsList';
import 'swiper/css';
import 'swiper/css/navigation';

type ApiRoom = {
  id: number;
  name: string;
  slug?: string;
  max_guests: number;
  price_per_night?: number;
  primary_image?: string | null;
  images?: { image: string }[];
  description?: string;
};

type DisplayRoom = {
  id: string | number;
  name: string;
  slug: string;
  max_guests: number;
  priceLabel: string;
  description: string;
  image: string;
};

function mapApiRoom(room: ApiRoom): DisplayRoom {
  return {
    id: room.id,
    name: room.name,
    slug: room.slug || String(room.id),
    max_guests: room.max_guests,
    priceLabel: room.price_per_night
      ? `BDT ${Number(room.price_per_night).toLocaleString()} / NIGHT`
      : 'View rates',
    description: room.description || '',
    image: toMediaUrl(room.primary_image || room.images?.[0]?.image, hotelImages.default),
  };
}

function mapCrownRoom(room: (typeof CROWN_ROOMS)[number]): DisplayRoom {
  return {
    id: room.id,
    name: room.name,
    slug: room.slug,
    max_guests: room.max_guests,
    priceLabel: `BDT ${room.price_bdt.toLocaleString()} / USD ${room.price_usd}`,
    description: room.description,
    image: room.image,
  };
}

export default function RoomsSection() {
  const [rooms, setRooms] = useState<DisplayRoom[]>(CROWN_ROOMS.map(mapCrownRoom));

  useEffect(() => {
    let mounted = true;

    async function loadRooms(): Promise<void> {
      try {
        const res = await api.get<{ results?: ApiRoom[] } | ApiRoom[]>('/rooms/');
        const data = unwrapList(res.data);
        if (mounted && data.length > 0) {
          setRooms(data.map(mapApiRoom));
        }
      } catch {
        // keep fallback
      }
    }

    void loadRooms();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="py-20 bg-[var(--color-light)]">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading subtitle="HOTEL CROWN" title="Rooms & Suites" />
        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {rooms.map((room) => (
            <SwiperSlide key={room.id}>
              <div className="bg-white group h-full">
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
                    {room.priceLabel}
                  </div>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-[var(--font-heading)] text-[var(--color-dark)] mb-3">
                    {room.name}
                  </h3>
                  {room.description && (
                    <p className="text-sm text-[var(--color-body)] leading-relaxed mb-4 line-clamp-4">
                      {room.description}
                    </p>
                  )}
                  <div className="flex justify-center gap-3">
                    <Link
                      to={`/room-details/${room.slug}`}
                      className="btn-primary text-xs !py-2 !px-5"
                    >
                      DETAILS
                    </Link>
                    <Link
                      to="/rooms"
                      className="btn-primary text-xs !py-2 !px-5 !bg-[var(--color-primary)] !text-white hover:!bg-[var(--color-primary-dark)]"
                    >
                      BOOK
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
