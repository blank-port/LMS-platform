import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContextObject';

// ──────────────────────────────────────────
// Tiny helpers
// ──────────────────────────────────────────
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TypingDots = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map(i => (
      <span key={i} className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }} />
    ))}
  </div>
);

const CourseCard = ({ course, backendUrl }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mt-2 hover:border-purple-500/40 transition-colors group">
    {course.thumbnail && (
      <img src={course.thumbnail} alt={course.title} className="w-full h-28 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
    )}
    <div className="p-3">
      <p className="font-bold text-white text-sm leading-tight">{course.title}</p>
      <p className="text-gray-400 text-[11px] mt-1 line-clamp-2">{course.description}</p>
      <div className="flex items-center justify-between mt-3">
        <span className="text-purple-400 font-black text-sm">
          {course.price === 0 ? 'FREE' : `₹${course.price?.toLocaleString()}`}
        </span>
        <a
          href={course.enrollUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[10px] font-black uppercase tracking-wider bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          Enroll →
        </a>
      </div>
    </div>
  </div>
);

const Message = ({ msg, backendUrl }) => {
  const isBot = msg.role === 'bot';
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-3`}>
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0 shadow">
          🤖
        </div>
      )}
      <div className={`max-w-[85%] ${isBot ? '' : 'ml-auto'}`}>
        {msg.type === 'courses' ? (
          <div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-gray-200 text-sm leading-relaxed">
              {msg.content}
            </div>
            {msg.courses?.map((c, i) => <CourseCard key={i} course={c} backendUrl={backendUrl} />)}
          </div>
        ) : (
          <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isBot
              ? 'bg-white/5 border border-white/10 text-gray-200'
              : 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/30'
          }`}>
            {msg.content}
            {msg.emailPreviewUrl && (
              <div className="mt-2 pt-2 border-t border-white/10">
                <a href={msg.emailPreviewUrl} target="_blank" rel="noreferrer"
                   className="text-[10px] text-purple-300 hover:text-purple-200 font-bold underline">
                  📧 Preview test email →
                </a>
              </div>
            )}
          </div>
        )}
        <p className="text-[9px] text-gray-600 mt-1 px-1">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────
// Main Widget
// ──────────────────────────────────────────
const AIChatWidget = () => {
  const { backendUrl } = useContext(AppContext);
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const [hasGreeted, setHasGreeted] = useState(false);

  // Registration state machine
  const [regState, setRegState] = useState('idle'); // idle | awaiting_name | awaiting_email | registered
  const [collectedName, setCollectedName] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ── Check if AI chat is enabled ──
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/chat/status`);
        setEnabled(data.enabled);
      } catch {
        setEnabled(false);
      }
    };
    checkStatus();
  }, [backendUrl]);

  // ── Auto-scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // ── Increment unread when closed ──
  useEffect(() => {
    if (!open && messages.length > 0 && messages[messages.length - 1]?.role === 'bot') {
      setUnread(prev => prev + 1);
    }
  }, [messages]);

  const addBotMessage = useCallback((content, extra = {}) => {
    setMessages(prev => [...prev, {
      role: 'bot', content, timestamp: Date.now(), ...extra
    }]);
  }, []);

  // ── Initial greeting when first opened ──
  const handleOpen = () => {
    setOpen(true);
    setUnread(0);
    if (!hasGreeted) {
      setHasGreeted(true);
      setTimeout(() => {
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          addBotMessage(
            "👋 Hello! I am **PrismBot**, your AI learning assistant.\n\nTo assist you better and personalize your experience, may I know your **full name**?"
          );
          setRegState('awaiting_name');
        }, 1200);
      }, 300);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ── Conversation history for Gemini context ──
  const buildHistory = (msgs, newMsg) => [
    ...msgs.map(m => ({ role: m.role === 'bot' ? 'model' : 'user', content: m.content })),
    { role: 'user', content: newMsg }
  ];

  // ── Send message ──
  const handleSend = async () => {
    const text = input.trim();
    if (!text || typing) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text, timestamp: Date.now() }]);
    setTyping(true);

    try {
      // ── State machine: name collection ──
      if (regState === 'awaiting_name') {
        const name = text.trim();
        if (name.length < 2) {
          setTyping(false);
          addBotMessage("Please provide a valid name to continue.");
          return;
        }
        setCollectedName(name);
        setTyping(false);
        addBotMessage(`Thank you, **${name}**! 😊\n\nNow, what is your **email address**? I'll use this to keep you updated.`);
        setRegState('awaiting_email');
        return;
      }

      // ── State machine: email collection ──
      if (regState === 'awaiting_email') {
        if (!emailRegex.test(text)) {
          setTyping(false);
          addBotMessage("⚠️ That doesn't look like a valid email. Please enter a valid email address (e.g. john@example.com).");
          return;
        }

        // Register user
        const { data } = await axios.post(`${backendUrl}/api/chat/register-user`, {
          name: collectedName, email: text
        });

        setTyping(false);

        if (data.alreadyExists) {
          setRegisteredEmail(text);
          setRegState('registered');
          addBotMessage(`Welcome back, **${collectedName}**! How can I help you today? ✨\n\nPlease select one of the following options to explore our academic pathways:`);
        } else if (data.success) {
          setRegisteredEmail(text);
          setRegState('registered');
          addBotMessage(
            `Welcome, **${collectedName}**! 🎉\n\nI have registered your interest. Your login credentials have also been sent to **${text}**. Check your inbox later.\n\nHow can I help you today? Please select one of the following:`,
            { emailPreviewUrl: data.emailPreviewUrl }
          );
        } else {
          addBotMessage(`❌ Encountered an issue: ${data.message}\n\nPlease try again.`);
        }
        return;
      }

      // ── Course search intent detection ──
      const courseKeywords = ['course', 'learn', 'study', 'class', 'program', 'training', 'certificate', 'skill'];
      const isCourseQuery = courseKeywords.some(k => text.toLowerCase().includes(k)) ||
        (regState === 'registered' && messages.length < 6);

      if (isCourseQuery) {
        // Extract search term
        const searchTerm = text.replace(/course|courses|about|for|in|on|learn|study|i want|want/gi, '').trim();
        const { data: courseData } = await axios.get(`${backendUrl}/api/chat/courses?q=${encodeURIComponent(searchTerm || text)}&email=${encodeURIComponent(registeredEmail)}&name=${encodeURIComponent(collectedName)}`);

        setTyping(false);

        if (courseData.courses?.length > 0) {
          addBotMessage(
            `🎓 Great choice! Based on your interest in **${searchTerm || text}**, here are the available courses:`,
            { type: 'courses', courses: courseData.courses }
          );
        } else {
          addBotMessage(`Currently, this course is not available. We have recorded your request and will notify you once it becomes available. 📋`);
        }
        return;
      }

      // ── Gemini AI response ──
      const history = buildHistory(messages, text);
      const { data } = await axios.post(`${backendUrl}/api/chat/message`, { message: text, history });
      setTyping(false);
      addBotMessage(data.text || "I'm here to help! Try asking about our courses or getting enrolled.");

    } catch (error) {
      setTyping(false);
      addBotMessage("⚠️ I'm having a momentary hiccup. Please try again in a moment.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const quickReplies = [
    { label: '• I want Web Development course', msg: 'I want Web Development course' },
    { label: '• I want Graphic Design course', msg: 'I want Graphic Design course' },
    { label: '• I want Data Science course', msg: 'I want Data Science course' }
  ];

  if (!enabled) return null;

  return (
    <>
      {/* ── Floating Button ── */}
      <button
        onClick={open ? () => setOpen(false) : handleOpen}
        className="fixed bottom-6 right-6 z-[9998] w-14 h-14 rounded-full shadow-2xl shadow-purple-900/50 flex items-center justify-center
                   bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500
                   transition-all duration-300 hover:scale-110 active:scale-95 group"
        title="Chat with PrismBot"
      >
        {open ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span className="text-2xl">🤖</span>
        )}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
        {/* Pulse ring */}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-purple-500 opacity-0 group-hover:opacity-20 animate-ping" />
        )}
      </button>

      {/* ── Chat Panel ── */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-[9999] w-[360px] max-h-[600px] flex flex-col rounded-3xl overflow-hidden shadow-2xl shadow-black/50
                     border border-white/10 animate-in slide-in-from-bottom-4 duration-300"
          style={{
            background: 'linear-gradient(135deg, #0d0d1a 0%, #13132a 100%)',
            backdropFilter: 'blur(24px)'
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border-b border-white/10 flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-base shadow">
              🤖
            </div>
            <div className="flex-1">
              <h3 className="text-white font-black text-sm">PrismBot</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <p className="text-green-400 text-[10px] font-bold">Online • AI Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setMessages([])}
              className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-white/5"
              title="Clear chat"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 min-h-0 scrollbar-thin scrollbar-thumb-white/10">
            {messages.length === 0 && !typing && (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🎓</div>
                <p className="text-gray-400 text-sm font-medium">Ask me anything about PrismEd courses!</p>
                <p className="text-gray-600 text-[11px] mt-1">I'm here to help you learn and grow.</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <Message key={i} msg={msg} backendUrl={backendUrl} />
            ))}

            {typing && (
              <div className="flex justify-start mb-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">
                  🤖
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl">
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies (Only shown post-registration) */}
          {regState === 'registered' && (
            <div className="px-4 pb-3 flex flex-wrap gap-2 flex-shrink-0">
              {quickReplies.map((qr, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(qr.msg);
                    setTimeout(() => {
                      setInput(q => {
                        if (q === qr.msg) {
                          handleSend();
                          return '';
                        }
                        return q;
                      });
                    }, 50);
                  }}
                  className="text-[10px] font-bold text-purple-300 border border-purple-800/40 bg-purple-900/20 hover:bg-purple-800/30 px-3 py-1.5 rounded-full transition-colors"
                >
                  {qr.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-white/10 flex items-end gap-2 flex-shrink-0 bg-black/20">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message… (Enter to send)"
              rows={1}
              className="flex-1 bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm rounded-2xl px-4 py-2.5 resize-none focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all leading-snug"
              style={{ maxHeight: '100px', minHeight: '42px' }}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || typing}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          {/* Footer */}
          <div className="text-center py-2 text-[9px] text-gray-700 border-t border-white/5 flex-shrink-0">
            Powered by PrismBot · Google Gemini AI
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
