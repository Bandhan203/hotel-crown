import { Link } from 'react-router-dom';
import SectionHeading from '../SectionHeading';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { CROWN_ROOMS } from '../../constants/rooms';
import 'swiper/css';
import 'swiper/css/navigation';

function mapCrownRoom(room: (typeof CROWN_ROOMS)[number]) {
  return {
    id: room.id,
    name: room.name,
    slug: room.slug,
    max_guests: room.max_guests,
    beds: room.beds,
    priceLabel: `BDT ${room.price_bdt.toLocaleString()} / USD ${room.price_usd}`,
    description: room.description,
    image: room.image,
  };
}

export default function RoomsSection() {
  // Always display CROWN_ROOMS — these are the hotel's official room categories.
  // API rooms (from backend) may differ in name/pricing; we keep the canonical list.
  const rooms = CROWN_ROOMS.map(mapCrownRoom);

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
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 group h-full overflow-hidden transition-all hover:shadow-md">
                <div className="relative overflow-hidden">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-[300px] object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm text-[var(--color-dark)] px-3 py-1 text-xs font-bold rounded-md">
                    {room.max_guests} Guests
                  </div>
                  <div className="absolute top-4 right-4 bg-[var(--color-dark)] text-white px-4 py-1.5 text-sm font-semibold rounded-full shadow-lg">
                    {room.priceLabel}
                  </div>
                </div>
                <div className="p-6 text-left">
                  <h3 className="text-xl font-[var(--font-heading)] text-[var(--color-dark)] font-semibold mb-3">
                    {room.name}
                  </h3>
                  {room.description && (
                    <p className="text-sm text-[var(--color-body)] leading-relaxed mb-4 line-clamp-4">
                      {room.description}
                    </p>
                  )}
                  <div className="flex justify-start gap-3">
                    <Link
                      to={`/room-details/${room.slug}`}
                      className="btn-primary text-xs !py-2 !px-5"
                    >
                      Details
                    </Link>
                    <Link
                      to="/rooms"
                      className="btn-primary text-xs !py-2 !px-5"
                    >
                      Book
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
