import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import SectionHeading from '../components/SectionHeading';
import { hotelImages } from '../constants/images';
import { CROWN_ROOMS } from '../constants/rooms';

export default function Rooms() {
  // Always display the hotel's canonical Crown rooms.
  // Backend rooms may have different names/prices from legacy data.
  const rooms = CROWN_ROOMS;

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-100 group overflow-hidden transition-all hover:shadow-md">
                <div className="relative overflow-hidden">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-[300px] object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm text-[var(--color-dark)] px-3 py-1 text-xs font-bold rounded-md">
                    {room.max_guests} {room.max_guests === 1 ? 'Guest' : 'Guests'}
                  </div>
                  <div className="absolute top-4 right-4 bg-[var(--color-dark)] text-white px-4 py-1.5 text-sm font-semibold rounded-full shadow-lg">
                    BDT {room.price_bdt.toLocaleString()} / USD {room.price_usd}
                  </div>
                </div>
                <div className="p-6 text-left">
                  <h3 className="text-xl font-[var(--font-heading)] text-[var(--color-dark)] font-semibold mb-1">
                    {room.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-[var(--color-body)] text-xs mb-3 font-medium">
                    <span>👤 {room.max_guests} {room.max_guests === 1 ? 'Person' : 'Persons'}</span>
                    {room.beds != null && <span>🛏️ {room.beds} Bed</span>}
                  </div>
                  <p className="text-sm text-[var(--color-body)] leading-relaxed mb-4 line-clamp-3">
                    {room.description}
                  </p>
                  <div className="flex justify-start gap-3">
                    <Link
                      to={`/room-details/${room.slug}`}
                      className="btn-primary text-xs !py-2 !px-5"
                    >
                      Details
                    </Link>
                    <Link
                      to={`/room-details/${room.slug}`}
                      className="btn-primary text-xs !py-2 !px-5"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hotel Tariff Section */}
      <section className="py-20 bg-[var(--color-light)]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="section-subtitle">HOTEL CROWN</span>
            <div className="flex items-center justify-center gap-4 mt-3 mb-2">
              <div className="h-px w-16 bg-[var(--color-primary)]" />
              <span className="text-[var(--color-primary)] text-xs">★ ★ ★ ★ ★</span>
              <div className="h-px w-16 bg-[var(--color-primary)]" />
            </div>
            <h2 className="font-[var(--font-heading)] text-4xl text-[var(--color-dark)] mt-2">Hotel Tariff</h2>
            <p className="text-[var(--color-body)] mt-4 text-sm">All rates are per night. Prices include complementary services.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-4 bg-[var(--color-dark)] text-white text-sm font-semibold">
              <div className="px-6 py-4">Room Category</div>
              <div className="px-6 py-4 text-center">Guests</div>
              <div className="px-6 py-4 text-center">BDT / Night</div>
              <div className="px-6 py-4 text-center">USD / Night</div>
            </div>

            {/* Rows */}
            {CROWN_ROOMS.map((room, i) => (
              <div
                key={room.id}
                className={`grid grid-cols-4 items-center border-b border-gray-100 last:border-0 transition-colors hover:bg-[var(--color-light)] ${
                  i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                <div className="px-6 py-5 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] shrink-0" />
                  <span className="font-[var(--font-heading)] text-[var(--color-dark)] text-base">{room.name}</span>
                </div>
                <div className="px-6 py-5 text-center">
                  <span className="inline-flex items-center justify-center gap-1 text-sm text-[var(--color-body)]">
                    <span>👤</span> {room.max_guests} {room.max_guests === 1 ? 'Person' : 'Persons'}
                  </span>
                </div>
                <div className="px-6 py-5 text-center">
                  <span className="font-bold text-[var(--color-dark)] text-lg">
                    ৳ {room.price_bdt.toLocaleString()}
                  </span>
                </div>
                <div className="px-6 py-5 text-center">
                  <span className="inline-block bg-[var(--color-primary)] text-white px-4 py-1 rounded-full text-sm font-semibold">
                    $ {room.price_usd}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-[var(--color-body)] mt-6">
            *** For any queries please contact on Official number ***
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-4 text-sm text-[var(--color-body)]">
            <span>📞 Front Office: <a href="tel:01334945375" className="text-[var(--color-primary)] font-medium hover:underline">01334 945 375</a></span>
            <span>📞 Reservations: <a href="tel:01334945376" className="text-[var(--color-primary)] font-medium hover:underline">01334 945 376</a>, <a href="tel:01334945377" className="text-[var(--color-primary)] font-medium hover:underline">01334 945 377</a></span>
          </div>
        </div>
      </section>
    </>
  );
}
