import PageHero from '../components/PageHero';
import { hotelImages } from '../constants/images';
import SectionHeading from '../components/SectionHeading';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';

const team = [
  {
    name: 'James Anderson',
    role: 'General Manager',
    image: hotelImages.team[0],
  },
  {
    name: 'Emily Roberts',
    role: 'Front Office Manager',
    image: hotelImages.team[1],
  },
  {
    name: 'Michael Chen',
    role: 'Executive Chef',
    image: hotelImages.team[2],
  },
  {
    name: 'Sarah Williams',
    role: 'Spa Director',
    image: hotelImages.team[3],
  },
  {
    name: 'David Thompson',
    role: 'Head Concierge',
    image: hotelImages.team[4],
  },
  {
    name: 'Laura Martinez',
    role: 'Events Coordinator',
    image: hotelImages.team[5],
  },
];

export default function Team() {
  return (
    <>
      <PageHero
        title="Our Team"
        breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Team' }]}
      />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading subtitle="THE TEAM" title="Meet Our Staff" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="group text-center">
                <div className="relative overflow-hidden mb-5">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-[400px] object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                    <div className="flex gap-3">
                      {[FiFacebook, FiTwitter, FiInstagram, FiLinkedin].map((Icon, i) => (
                        <a
                          key={i}
                          href="#"
                          className="w-10 h-10 border border-white text-white flex items-center justify-center hover:bg-[var(--color-primary)] hover:border-[var(--color-primary)] transition-colors"
                        >
                          <Icon size={16} />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
                <h3 className="font-[var(--font-heading)] text-xl text-[var(--color-dark)]">
                  {member.name}
                </h3>
                <p className="text-[var(--color-primary)] text-sm font-[var(--font-condensed)] tracking-[2px] uppercase mt-1">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
