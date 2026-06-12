import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import api from '../services/api';

type SiteSetting = {
  id: number;
  key: string;
  value: string;
};

type SiteSettingsMap = Record<string, string>;

type SiteSettingsContextType = {
  settings: SiteSettingsMap;
  loading: boolean;
  refresh: () => Promise<void>;
  getSetting: (key: string, fallback?: string) => string;
};

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

const HEAD_SCRIPT_ID = 'cms-site-settings-head-script';
const BODY_SCRIPT_ID = 'cms-site-settings-body-script';

function upsertMetaTag(name: string, content: string): void {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

function applyScript(scriptId: string, scriptContent: string, target: 'head' | 'body'): void {
  const existing = document.getElementById(scriptId);
  if (existing) {
    existing.remove();
  }

  if (!scriptContent.trim()) return;

  const script = document.createElement('script');
  script.id = scriptId;
  script.type = 'text/javascript';
  script.text = scriptContent;

  if (target === 'head') {
    document.head.appendChild(script);
  } else {
    document.body.appendChild(script);
  }
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettingsMap>({});
  const [loading, setLoading] = useState(true);

  const refresh = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await api.get<SiteSetting[]>('/site-settings/');
      const map: SiteSettingsMap = {};
      (res.data || []).forEach((item) => {
        map[item.key] = item.value;
      });
      setSettings(map);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    const siteName = settings.site_name || 'Hotel Crown';
    const seoTitle = settings.seo_default_title || `${siteName} | Rajshahi`;
    const seoDescription = settings.seo_meta_description || 'Experience Comfort, Luxury & Hospitality at Hotel Crown, Padma Abasik, Rajshahi, Bangladesh.';
    const seoKeywords = settings.seo_keywords || 'Hotel Crown, Rajshahi hotel, Padma Abasik, luxury hotel Bangladesh, hotel booking Rajshahi';

    document.title = seoTitle;
    upsertMetaTag('description', seoDescription);
    upsertMetaTag('keywords', seoKeywords);

    applyScript(HEAD_SCRIPT_ID, settings.analytics_head_script || '', 'head');
    applyScript(BODY_SCRIPT_ID, settings.custom_body_script || '', 'body');
  }, [settings]);

  const value = useMemo<SiteSettingsContextType>(() => ({
    settings,
    loading,
    refresh,
    getSetting: (key: string, fallback = '') => settings[key] || fallback,
  }), [settings, loading]);

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettingsContextType {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) {
    throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  }
  return ctx;
}
