import React, { useEffect, useMemo, useState } from 'react';
import {
  VideoCameraIcon,
  KeyIcon,
  LockClosedIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  SignalIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import api from '@/utils/api';

const Card = ({ title, icon: Icon, children }) => (
  <div className="bg-[var(--surface)] rounded-[2rem] shadow-sm border border-[var(--border)] overflow-hidden">
    <div className="px-8 py-6 border-b border-[var(--border)] bg-[var(--background)]/50 flex items-center gap-4">
      <div className="w-10 h-10 bg-[var(--surface)] rounded-xl flex items-center justify-center text-emerald-400 shadow-sm border border-emerald-800/30">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-[var(--text-main)]">{title}</h3>
    </div>
    <div className="p-8">{children}</div>
  </div>
);

const FormField = ({ label, value, onChange, type = 'text', placeholder, tooltip }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-2">
      <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">{label}</label>
      {tooltip && (
        <div className="group relative">
          <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-help" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl border border-gray-800">
            {tooltip}
          </div>
        </div>
      )}
    </div>
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-5 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-[var(--text-main)] placeholder:text-gray-300"
    />
  </div>
);

const EMPTY_SETTINGS = {
  livekit_url: '',
  livekit_api_key: '',
  livekit_api_secret: ''
};

const getStatusMeta = (readiness) => {
  if (readiness?.configured) {
    return {
      key: 'configured',
      title: 'Fully Configured',
      description: 'System ready for live classroom orchestration.',
      container: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      Icon: CheckCircleIcon
    };
  }

  if (readiness?.hasUrl || readiness?.hasApiKey || readiness?.hasSecret) {
    return {
      key: 'partially',
      title: 'Partially Configured',
      description: 'Some required LiveKit values are still missing.',
      container: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      Icon: ExclamationTriangleIcon
    };
  }

  return {
    key: 'missing',
    title: 'Missing Configuration',
    description: 'No complete LiveKit configuration is available yet.',
    container: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    Icon: XCircleIcon
  };
};

const LiveKitSettings = () => {
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [settings, setSettings] = useState(EMPTY_SETTINGS);
  const [secretConfigured, setSecretConfigured] = useState(false);
  const [readiness, setReadiness] = useState({
    hasUrl: false,
    hasApiKey: false,
    hasSecret: false,
    configured: false,
    source: 'missing'
  });

  const statusMeta = useMemo(() => getStatusMeta(readiness), [readiness]);

  const loadSettings = async () => {
    setBooting(true);
    try {
      const { data } = await api.get('/setting/livekit-admin');
      if (data.success) {
        setSettings({
          livekit_url: data.settings?.livekit_url || '',
          livekit_api_key: data.settings?.livekit_api_key || '',
          livekit_api_secret: ''
        });
        setSecretConfigured(Boolean(data.secretConfigured));
        setReadiness(data.readiness || {
          hasUrl: false,
          hasApiKey: false,
          hasSecret: false,
          configured: false,
          source: 'missing'
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load LiveKit settings.');
    } finally {
      setBooting(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        livekit_url: settings.livekit_url,
        livekit_api_key: settings.livekit_api_key
      };

      if (settings.livekit_api_secret.trim()) {
        payload.livekit_api_secret = settings.livekit_api_secret.trim();
      }

      const { data } = await api.patch('/setting/livekit-admin', payload);
      if (data.success) {
        toast.success('LiveKit configuration saved.');
        setSettings((prev) => ({
          ...prev,
          livekit_api_secret: ''
        }));
        setSecretConfigured(Boolean(data.secretConfigured));
        setReadiness(data.readiness || readiness);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save LiveKit settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (booting) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-sm font-bold text-[var(--text-muted)]">Loading LiveKit settings...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 flex-1">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[var(--surface)] p-8 rounded-[2rem] shadow-sm border border-[var(--border)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-400 shadow-inner">
            <VideoCameraIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">LiveKit Nexus</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Administration / Real-time Infrastructure</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className={`flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95 relative z-10 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Saving...' : (
            <>
              <CheckCircleIcon className="w-5 h-5" />
              Save Configuration
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card title="LiveKit Credentials" icon={KeyIcon}>
            <div className="flex flex-col gap-8">
              <div className="p-6 bg-emerald-900/10 border border-emerald-800/20 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 mt-1">
                    <InformationCircleIcon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-emerald-300 text-sm">Deployment Guidance</h4>
                    <p className="text-[11px] text-emerald-300/70 leading-relaxed">
                      Database settings override server environment variables. If any database value is missing, PrismEd falls back to `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET`.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <FormField
                  label="LiveKit WebSocket URL"
                  value={settings.livekit_url}
                  onChange={(v) => handleChange('livekit_url', v)}
                  placeholder="wss://prismed-lms.livekit.cloud"
                  tooltip="The WebSocket URL for your LiveKit instance. Usually starts with wss://"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="API Key"
                    value={settings.livekit_api_key}
                    onChange={(v) => handleChange('livekit_api_key', v)}
                    placeholder="devkey"
                    tooltip="Your LiveKit project API key."
                  />
                  <div className="space-y-2">
                    <FormField
                      label="API Secret"
                      value={settings.livekit_api_secret}
                      onChange={(v) => handleChange('livekit_api_secret', v)}
                      type="password"
                      placeholder={secretConfigured ? 'Stored secret configured. Enter a new secret to replace it.' : 'Enter LiveKit API secret'}
                      tooltip="The stored secret is never returned to the frontend. Leave this blank to keep the existing stored secret."
                    />
                    <p className="text-[10px] font-bold text-[var(--text-muted)]">
                      {secretConfigured
                        ? 'A secret is already stored. This field only updates it when you enter a new value.'
                        : 'No database secret stored yet. Environment fallback may still be active.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-8">
          <Card title="Operational Status" icon={SignalIcon}>
            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center gap-3 transition-all duration-500 ${statusMeta.container}`}>
                  <statusMeta.Icon className="w-10 h-10" />
                  <div>
                    <h4 className="font-black uppercase tracking-widest text-xs">{statusMeta.title}</h4>
                    <p className="text-[10px] mt-1 opacity-70">{statusMeta.description}</p>
                  </div>
                </div>

                <div className="bg-[var(--background)] rounded-2xl p-6 border border-[var(--border)] space-y-4">
                  <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Readiness Details</h5>
                  <div className="space-y-3 text-[11px] text-[var(--text-main)]">
                    <div className="flex items-center justify-between">
                      <span>WebSocket URL</span>
                      <span className={readiness.hasUrl ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                        {readiness.hasUrl ? 'Present' : 'Missing'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>API Key</span>
                      <span className={readiness.hasApiKey ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                        {readiness.hasApiKey ? 'Present' : 'Missing'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>API Secret</span>
                      <span className={readiness.hasSecret ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                        {readiness.hasSecret ? 'Present' : 'Missing'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Config Source</span>
                      <span className="font-bold capitalize text-[var(--text-main)]">{readiness.source || 'missing'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--background)] rounded-2xl p-6 border border-[var(--border)]">
                  <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Fallback Strategy</h5>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400">
                      <GlobeAltIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[var(--text-main)]">Environment Variables</p>
                      <p className="text-[9px] text-gray-500">Missing database values fall back to server env configuration.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-white">
                    <LockClosedIcon className="w-4 h-4" />
                  </div>
                  <h5 className="text-[10px] font-black uppercase tracking-widest">Security Protocol</h5>
                </div>
                <p className="text-[10px] leading-relaxed text-gray-400">
                  LiveKit secrets remain backend-only. This screen never reloads the stored secret into the browser and non-admin/public settings endpoints do not expose it.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiveKitSettings;
