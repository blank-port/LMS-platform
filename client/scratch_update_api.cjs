const fs = require('fs');
const path = 'e:\\lms-full-stack\\lms-full-stack\\client\\src\\pages\\admin\\settings\\ApiSettings.jsx';
let content = fs.readFileSync(path, 'utf8');

const target = `              </div>
           </div>
        </Card>

        <div className="flex flex-col gap-8">`;

const replacement = `              </div>
           </div>
        </Card>

        <div className="flex flex-col gap-8">
          <Card title="Live WebRTC Classroom" icon={VideoCameraIcon}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                 <span className="text-xs font-black text-gray-400 uppercase tracking-widest">LiveKit Integration</span>
                 <div className="grid grid-cols-1 gap-4">
                   <FormField label="WebSocket URL" value={settings.livekit_url} onChange={(v) => handleChange('livekit_url', v)} placeholder="wss://your-project.livekit.cloud" tooltip="The WebSocket URL for your LiveKit project" />
                   <FormField label="API Key" value={settings.livekit_api_key} onChange={(v) => handleChange('livekit_api_key', v)} placeholder="API Key" tooltip="Your LiveKit API Key" />
                   <FormField label="API Secret" value={settings.livekit_api_secret} onChange={(v) => handleChange('livekit_api_secret', v)} type="password" placeholder="••••••••••••••••" tooltip="Your LiveKit API Secret" />
                 </div>
              </div>
            </div>
          </Card>`;

content = content.replace(target, replacement);
fs.writeFileSync(path, content);
console.log('Replaced UI section');
