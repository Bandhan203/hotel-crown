import { useEffect, useState } from 'react';
import { MdTune, MdSave } from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';

interface SiteSetting {
  id: number;
  key: string;
  value: string;
}

type SettingField = {
  key: string;
  label: string;
  type?: 'text' | 'textarea';
  placeholder?: string;
};

type SettingSection = {
  title: string;
  description: string;
  fields: SettingField[];
};

const SECTIONS: SettingSection[] = [
  {
    title: 'Branding',
    description: 'Global brand identity values used in navbar, footer, and headings.',
    fields: [
      { key: 'site_name', label: 'Site Name', placeholder: 'CAPPA Hotel' },
      { key: 'site_tagline', label: 'Site Tagline / About Copy', type: 'textarea' },
      { key: 'about_title', label: 'Home About Title' },
      { key: 'about_body', label: 'Home About Body', type: 'textarea' },
      { key: 'about_image', label: 'Home About Image URL', placeholder: '/media/hotel/hotel-010.jpg' },
      { key: 'primary_cta_label', label: 'Primary CTA Label', placeholder: 'BOOK NOW' },
      { key: 'primary_cta_link', label: 'Primary CTA Link', placeholder: '/rooms' },
      { key: 'footer_copyright', label: 'Footer Copyright', placeholder: '© Copyright ...' },
    ],
  },
  {
    title: 'Home Page Content',
    description: 'Landing page sections controlled from CMS.',
    fields: [
      { key: 'home_services_intro', label: 'Services Section Intro', type: 'textarea' },
      { key: 'home_booking_tagline', label: 'Booking Section Tagline', type: 'textarea' },
      { key: 'home_booking_image', label: 'Booking Section Background URL', placeholder: '/images/...' },
      { key: 'home_video_title', label: 'Video Section Title' },
      { key: 'home_video_url', label: 'Video URL', placeholder: 'https://youtu.be/...' },
      { key: 'home_video_image', label: 'Video Section Background URL', placeholder: '/images/...' },
    ],
  },
  {
    title: 'Contact Information',
    description: 'Displayed across contact, footer, and quick-contact areas.',
    fields: [
      { key: 'contact_phone', label: 'Front Office Phone (display)', placeholder: '01334 945 375' },
      { key: 'contact_phone_href', label: 'Front Office Phone (tel link)', placeholder: '01334945375' },
      { key: 'contact_phone_reservations', label: 'Reservations Phone (display)', placeholder: '01334 945 376' },
      { key: 'contact_phone_reservations_href', label: 'Reservations Phone (tel link)', placeholder: '01334945376' },
      { key: 'contact_email', label: 'Contact Email', placeholder: 'hotelcrownbd@gmail.com' },
      { key: 'contact_website', label: 'Website', placeholder: 'www.hotelcrownbd.com' },
      { key: 'contact_address', label: 'Address', type: 'textarea' },
      { key: 'contact_map_embed_url', label: 'Google Map Embed URL', type: 'textarea' },
    ],
  },
  {
    title: 'SEO Defaults',
    description: 'Default SEO values used globally when page-level SEO is not provided.',
    fields: [
      { key: 'seo_default_title', label: 'Default Meta Title' },
      { key: 'seo_meta_description', label: 'Meta Description', type: 'textarea' },
      { key: 'seo_keywords', label: 'Meta Keywords', type: 'textarea' },
    ],
  },
  {
    title: 'Social Media',
    description: 'Footer social profile links.',
    fields: [
      { key: 'social_facebook', label: 'Facebook URL' },
      { key: 'social_twitter', label: 'Twitter URL' },
      { key: 'social_instagram', label: 'Instagram URL' },
      { key: 'social_pinterest', label: 'Pinterest URL' },
      { key: 'social_whatsapp', label: 'WhatsApp URL' },
      { key: 'social_tripadvisor', label: 'Tripadvisor URL' },
    ],
  },
  {
    title: 'Navigation',
    description: 'Optional navigation labels/links for future dynamic menu rendering.',
    fields: [
      { key: 'nav_override_json', label: 'Navigation JSON', type: 'textarea', placeholder: '[{"name":"Home","path":"/"}]' },
    ],
  },
  {
    title: 'Scripts',
    description: 'Global custom scripts injected across the website.',
    fields: [
      { key: 'analytics_head_script', label: 'Head Script', type: 'textarea', placeholder: '/* analytics script */' },
      { key: 'custom_body_script', label: 'Body Script', type: 'textarea', placeholder: '/* chat widget script */' },
    ],
  },
];

const KNOWN_KEYS = SECTIONS.flatMap((section) => section.fields.map((field) => field.key));

export default function CMSSiteSettings() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const { refresh: refreshPublicSettings } = useSiteSettings();

  const fetchSettings = () => {
    setLoading(true);
    api.get('/admin/site-settings/')
      .then(res => {
        const list = res.data.results || res.data;
        setSettings(list);
        const map: Record<string, string> = {};
        list.forEach((item: SiteSetting) => {
          map[item.key] = item.value;
        });
        setDraft(map);
      })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSettings(); }, []);

  const upsertSetting = async (key: string, value: string) => {
    const existing = settings.find((s) => s.key === key);
    if (existing) {
      await api.put(`/admin/site-settings/${existing.id}/`, { key, value });
      return;
    }
    await api.post('/admin/site-settings/', { key, value });
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      await Promise.all(KNOWN_KEYS.map((key) => upsertSetting(key, draft[key] || '')));
      toast.success('Site settings saved');
      fetchSettings();
      await refreshPublicSettings();
    } catch {
      toast.error('Failed to save settings');
    }
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: '"Gilda Display", serif' }}>
          <MdTune className="inline mr-2 text-primary" />Site Settings
        </h1>
        <button onClick={saveAll} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-[#c49b63] text-white rounded-lg text-sm font-medium disabled:opacity-60">
          <MdSave size={18} /> {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      <p className="text-sm text-gray-400">
        Centralized global configuration panel. Changes are applied immediately to the public site without redeployment.
      </p>

      <div className="space-y-5">
        {SECTIONS.map((section) => (
          <div key={section.title} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
            <h2 className="text-white font-semibold text-lg">{section.title}</h2>
            <p className="text-sm text-gray-400 mt-1 mb-4">{section.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.fields.map((field) => (
                <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm text-gray-300 mb-1">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      rows={4}
                      value={draft[field.key] || ''}
                      onChange={(e) => setDraft((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 bg-[#0f0f0f] border border-white/10 rounded-lg text-white text-sm focus:border-primary outline-none resize-none"
                    />
                  ) : (
                    <input
                      value={draft[field.key] || ''}
                      onChange={(e) => setDraft((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 bg-[#0f0f0f] border border-white/10 rounded-lg text-white text-sm focus:border-primary outline-none"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
