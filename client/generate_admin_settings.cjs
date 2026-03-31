const fs = require('fs');
const path = require('path');

const settings = [
  { name: 'SystemSetting', title: 'System Setting', icon: '⚙️' },
  { name: 'Activation', title: 'Activation', icon: '🔑' },
  { name: 'GeneralSetting', title: 'General Setting', icon: '🛠️' },
  { name: 'Commission', title: 'Commission Rates', icon: '💸' },
  { name: 'EmailSetup', title: 'Email Setup', icon: '📧' },
  { name: 'EmailTemplate', title: 'Email Template', icon: '📝' },
  { name: 'PaymentMethodSetting', title: 'Payment Methods', icon: '💳' },
  { name: 'ApiSettings', title: 'API Settings', icon: '🔌' },
  { name: 'VimeoConfiguration', title: 'Vimeo Configuration', icon: '🎬' },
  { name: 'VdoCipherConfiguration', title: 'VdoCipher Config', icon: '🎥' },
  { name: 'GDriveConfiguration', title: 'gDrive Configuration', icon: '☁️' },
  { name: 'HomepageSeoSetup', title: 'Homepage SEO Setup', icon: '🔍' },
  { name: 'Language', title: 'Language', icon: '🌐' },
  { name: 'Currency', title: 'Currency', icon: '💲' },
  { name: 'Timezone', title: 'Timezone', icon: '🕒' },
  { name: 'City', title: 'City', icon: '🏙️' },
  { name: 'CacheSetting', title: 'Cache Setting', icon: '🗄️' },
  { name: 'QueueSettings', title: 'Queue Settings', icon: '⏳' },
  { name: 'CronJob', title: 'Cron Job', icon: '🤖' },
  { name: 'ReCaptcha', title: 'reCaptcha', icon: '✅' },
  { name: 'SocialLogin', title: 'Social Login', icon: '👤' },
  { name: 'PayoutAccount', title: 'Payout Account', icon: '🏦' },
  { name: 'CookieGdprSetting', title: 'Cookie/GDPR Setting', icon: '🍪' },
  { name: 'SmsSettings', title: 'SMS Settings', icon: '📱' },
  { name: 'AnalyticsTool', title: 'Analytics Tool', icon: '📊' },
  { name: 'PusherSetting', title: 'Pusher Setting', icon: '🔔' },
  { name: 'ModuleManager', title: 'Module Manager', icon: '🧩' },
  { name: 'AboutUpdate', title: 'About & Update', icon: '🔄' }
];

const dir = path.join(__dirname, 'src', 'pages', 'admin', 'settings');

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

settings.forEach(setting => {
  const content = `import React from 'react';

const ${setting.name} = () => {
  return (
    <div className="flex flex-col gap-8 flex-1">
      {/* Header aligned with other admin pages */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 text-2xl shadow-inner">
             {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
             ${setting.icon}
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">${setting.title}</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Administration / ${setting.title}</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 min-h-[500px] flex items-center justify-center">
         <div className="text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl opacity-50">${setting.icon}</span>
            </div>
            <h2 className="text-xl font-bold text-gray-600 mb-2">Module Active</h2>
            <p className="text-gray-400">The ${setting.title} configuration panel is ready for deployment.</p>
         </div>
      </div>
    </div>
  );
};

export default ${setting.name};
`;

  fs.writeFileSync(path.join(dir, `${setting.name}.jsx`), content);
});

console.log('Successfully generated 28 settings components.');
