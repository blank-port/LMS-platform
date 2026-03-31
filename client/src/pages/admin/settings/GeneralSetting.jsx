import React, { useState, useEffect, useContext } from 'react';
import {
  BuildingOfficeIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  IdentificationIcon,
  PhotoIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { AppContext } from '../../../context/AppContextObject.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const LANGUAGES = [
  'English', 'Hindi', 'Spanish', 'French', 'German',
  'Chinese', 'Japanese', 'Arabic', 'Russian', 'Portuguese'
];

const TIMEZONES = [
  '(UTC-12:00) International Date Line West', '(UTC-11:00) Samoa', '(UTC-10:00) Hawaii',
  '(UTC-09:00) Alaska', '(UTC-08:00) Pacific Time (US & Canada)', '(UTC-07:00) Mountain Time (US & Canada)',
  '(UTC-06:00) Central Time (US & Canada)', '(UTC-05:00) Eastern Time (US & Canada)', '(UTC-04:00) Atlantic Time (Canada)',
  '(UTC-03:00) Buenos Aires, Georgetown', '(UTC-02:00) Mid-Atlantic', '(UTC-01:00) Azores',
  '(UTC+00:00) London, Dublin, Lisbon', '(UTC+01:00) Berlin, Paris, Rome, Madrid', '(UTC+02:00) Cairo, Jerusalem, South Africa',
  '(UTC+03:00) Moscow, Riyadh, Nairobi', '(UTC+04:00) Abu Dhabi, Muscat, Baku', '(UTC+05:00) Islamabad, Karachi, Tashkent',
  '(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi', '(UTC+06:00) Astana, Dhaka', '(UTC+07:00) Bangkok, Hanoi, Jakarta',
  '(UTC+08:00) Beijing, Hong Kong, Singapore', '(UTC+09:00) Tokyo, Seoul, Osaka', '(UTC+10:00) Sydney, Melbourne, Guam',
  '(UTC+11:00) Magadan, Solomon Is.', '(UTC+12:00) Auckland, Wellington, Fiji'
];

const DATE_FORMATS = [
  'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'D MMM YYYY', 'MMM D, YYYY'
];

const Card = ({ title, icon: Icon, children }) => (
  <div className="bg-[var(--surface)] rounded-[2rem] shadow-sm border border-[var(--border)] overflow-hidden">
    <div className="px-8 py-6 border-b border-[var(--border)] bg-[var(--background)]/50 flex items-center gap-4">
      <div className="w-10 h-10 bg-[var(--surface)] rounded-xl flex items-center justify-center text-purple-400 shadow-sm border border-purple-900/30">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-[var(--text-main)]">{title}</h3>
    </div>
    <div className="p-8">{children}</div>
  </div>
);

const FormField = ({ label, value, onChange, type = "text", placeholder, tooltip }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-2">
      <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">{label}</label>
      {tooltip && (
        <div className="group relative">
          <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-help" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
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
      className="w-full px-5 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-medium text-[var(--text-main)] bg-[var(--surface)] placeholder:text-gray-300"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options, tooltip }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-2">
      <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">{label}</label>
      {tooltip && (
        <div className="group relative">
          <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-help" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            {tooltip}
          </div>
        </div>
      )}
    </div>
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-5 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-medium text-[var(--text-main)] bg-[var(--surface)] cursor-pointer hover:border-purple-200"
    >
      <option value="" disabled className="bg-[var(--surface)]">Select {label}</option>
      {options.map((opt) => (
        <option key={opt} value={opt} className="bg-[var(--surface)]">{opt}</option>
      ))}
    </select>
  </div>
);

const Toggle = ({ label, checked, onChange, tooltip }) => (
  <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--background)]/50 border border-[var(--border)]">
    <div className="flex items-center gap-2">
      <span className="text-sm font-bold text-[var(--text-muted)]">{label}</span>
      {tooltip && (
        <div className="group relative">
          <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-help" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            {tooltip}
          </div>
        </div>
      )}
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--surface)] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
    </label>
  </div>
);

const GeneralSetting = () => {
  const { fetchAllSettings, updateBatchSettings, backendUrl, token, fetchPublicSettings } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    site_title: '',
    site_email: '',
    site_phone: '',
    site_country: '',
    site_zip: '',
    site_address: '',
    default_language: 'English',
    date_format: 'DD/MM/YYYY',
    timezone: 'UTC+0',
    public_registration: true,
    instructor_registration: false,
    show_categories: true,
    fixed_navbar: true,
    hide_search: false,
    hide_footer_mobile: false,
    show_cart: true,
    hide_ecommerce: false,
    hide_comments: false,
    hide_social: false,
    hide_enrollment: false
  });

  useEffect(() => {
    const loadSettings = async () => {
      const data = await fetchAllSettings();
      if (data && data.length > 0) {
        const settingsMap = {};
        data.forEach(s => settingsMap[s.key] = s.value);
        setSettings(prev => ({ ...prev, ...settingsMap }));
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const success = await updateBatchSettings(settings);
    if (success) {
      await fetchPublicSettings();
      toast.success('Settings synchronized across platform');
    }
    setLoading(false);
  };

  const handleLogoUpload = async (key, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('logo', file);
    formData.append('key', key);

    const loadingToast = toast.loading(`Uploading ${key.replace('site_logo_', '').replace('_', ' ')}...`);
    try {
      const { data } = await axios.post(`${backendUrl}/api/setting/upload-logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      if (data.success) {
        setSettings(prev => ({ ...prev, [key]: data.imageUrl }));
        await fetchPublicSettings();
        toast.update(loadingToast, { render: 'Logo updated successfully', type: 'success', isLoading: false, autoClose: 3000 });
      } else {
        toast.update(loadingToast, { render: data.message, type: 'error', isLoading: false, autoClose: 3000 });
      }
    } catch (error) {
      toast.update(loadingToast, { render: 'Upload failed', type: 'error', isLoading: false, autoClose: 3000 });
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };


  return (
    <div className="flex flex-col gap-8 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[var(--surface)] p-8 rounded-[2rem] shadow-sm border border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-400 text-2xl shadow-inner">
            🛠️
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">General Setting</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Administration / Global Configuration</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className={`flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 transition-all active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Saving...' : (
            <>
              <CheckCircleIcon className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Logos & Identity */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          <Card title="Brand Identity" icon={PhotoIcon}>
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Logos</span>
                <div className="grid grid-cols-1 gap-6">
                  {[
                    { label: 'Header Logo', key: 'site_logo_header' },
                    { label: 'Footer Logo', key: 'site_logo_footer' },
                    { label: 'Student Panel Logo', key: 'site_logo_student' },
                    { label: 'Favicon', key: 'site_favicon' }
                  ].map((item) => (
                    <div key={item.key} className="relative p-6 border-2 border-dashed border-[var(--border)] rounded-2xl flex flex-col items-center gap-3 hover:border-purple-200 transition-colors group">
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => handleLogoUpload(item.key, e.target.files[0])}
                      />
                      {settings[item.key] ? (
                        <div className="w-full flex flex-col items-center gap-2">
                          <img src={settings[item.key]} alt={item.label} className="h-12 object-contain rounded-lg" />
                          <span className="text-[10px] font-black text-purple-400 uppercase">Change {item.label}</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-[var(--background)] rounded-xl flex items-center justify-center text-gray-400 group-hover:text-purple-400 transition-colors">
                            <PhotoIcon className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-bold text-gray-500 uppercase">{item.label}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Middle Column: Global Settings */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <Card title="Site Information" icon={IdentificationIcon}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Site Title" value={settings.site_title} onChange={(v) => handleChange('site_title', v)} placeholder="e.g., PrismEd LMS" tooltip="The main name of your institution displayed everywhere" />
              <FormField label="Email" value={settings.site_email} onChange={(v) => handleChange('site_email', v)} type="email" placeholder="contact@prismed.com" tooltip="The primary contact email for the system" />
              <FormField label="Phone" value={settings.site_phone} onChange={(v) => handleChange('site_phone', v)} placeholder="+1 (555) 000-0000" />
              <FormField label="Country" value={settings.site_country} onChange={(v) => handleChange('site_country', v)} placeholder="United States" />
              <FormField label="Zip Code" value={settings.site_zip} onChange={(v) => handleChange('site_zip', v)} placeholder="10001" />
              <FormField label="Address" value={settings.site_address} onChange={(v) => handleChange('site_address', v)} placeholder="123 Education St, NY" />
            </div>
          </Card>

          <Card title="Localization" icon={GlobeAltIcon}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField label="Default Language" value={settings.default_language} onChange={(v) => handleChange('default_language', v)} options={LANGUAGES} tooltip="System default language for all modules" />
              <SelectField label="Date Format" value={settings.date_format} onChange={(v) => handleChange('date_format', v)} options={DATE_FORMATS} tooltip="Date display format across the platform" />
              <SelectField label="Timezone" value={settings.timezone} onChange={(v) => handleChange('timezone', v)} options={TIMEZONES} tooltip="Global system timezone" />
            </div>
          </Card>

          <Card title="Feature Governance" icon={ComputerDesktopIcon}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Toggle label="Public Student Registration" checked={settings.public_registration} onChange={(v) => handleChange('public_registration', v)} tooltip="Allow new students to sign up from the frontend" />
              <Toggle label="Public Instructor Registration" checked={settings.instructor_registration} onChange={(v) => handleChange('instructor_registration', v)} tooltip="Allow potential educators to apply for account" />
              <Toggle label="Show Categories in Frontend" checked={settings.show_categories} onChange={(v) => handleChange('show_categories', v)} />
              <Toggle label="Fixed Navbar" checked={settings.fixed_navbar} onChange={(v) => handleChange('fixed_navbar', v)} />
              <Toggle label="Hide Menu Search Box" checked={settings.hide_search} onChange={(v) => handleChange('hide_search', v)} />
              <Toggle label="Hide Footer from Mobile" checked={settings.hide_footer_mobile} onChange={(v) => handleChange('hide_footer_mobile', v)} />
              <Toggle label="Show Cart" checked={settings.show_cart} onChange={(v) => handleChange('show_cart', v)} />
              <Toggle label="Hide E-Commerce" checked={settings.hide_ecommerce} onChange={(v) => handleChange('hide_ecommerce', v)} tooltip="Disables all fiscal modules if enabled" />
              <Toggle label="Hide Blog Comments" checked={settings.hide_comments} onChange={(v) => handleChange('hide_comments', v)} />
              <Toggle label="Hide Social Share" checked={settings.hide_social} onChange={(v) => handleChange('hide_social', v)} />
              <Toggle label="Hide Enrollment Count" checked={settings.hide_enrollment} onChange={(v) => handleChange('hide_enrollment', v)} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GeneralSetting;
