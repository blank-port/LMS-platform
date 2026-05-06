import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '@/utils/api';
import { AppContext } from '../../context/AppContextObject';
import { useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-toastify';

// ------------------------------------------
// Tiny helpers
// ------------------------------------------
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TypingDots = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map(i => (
      <span key={i} className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }} />
    ))}
  </div>
);

const CourseCard = ({ course }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mt-2 hover:border-emerald-500/40 transition-colors group">
    {course.thumbnail && (
      <img src={course.thumbnail} alt={course.title} className="w-full h-28 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
    )}
    <div className="p-3">
      <p className="font-bold text-white text-sm leading-tight">{course.title}</p>
      <p className="text-gray-400 text-[11px] mt-1 line-clamp-2">{course.description}</p>
      <div className="flex items-center justify-between mt-3">
        <span className="text-emerald-400 font-black text-sm">
          {course.price === 0 ? 'FREE' : `INR ${course.price?.toLocaleString()}`}
        </span>
        <a
          href={course.enrollUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          Enroll course
        </a>
      </div>
    </div>
  </div>
);

const Message = ({ msg }) => {
  const isBot = msg.role === 'bot';
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-3`}>
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0 shadow">
          AI
        </div>
      )}
      <div className={`max-w-[85%] ${isBot ? '' : 'ml-auto'}`}>
        {msg.type === 'courses' ? (
          <div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-gray-200 text-sm leading-relaxed">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
            {msg.courses?.map((c, i) => <CourseCard key={i} course={c} />)}
          </div>
        ) : (
          <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${isBot
              ? 'bg-white/5 border border-white/10 text-gray-200'
              : 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/30'
            }`}>
            <div className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
            {msg.type === 'action' && (
              <div className="mt-4">
                <button
                  onClick={msg.onAction}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-xl shadow-lg transition-all active:scale-95"
                >
                  {msg.actionLabel}
                </button>
              </div>
            )}
            {msg.emailPreviewUrl && (
              <div className="mt-2 pt-2 border-t border-white/10">
                <a href={msg.emailPreviewUrl} target="_blank" rel="noreferrer"
                  className="text-[10px] text-emerald-300 hover:text-emerald-200 font-bold underline">
                  Preview test email
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

// ------------------------------------------
// Main Widget
// ------------------------------------------
const AIChatWidget = () => {
  const { user, allCourses, enrolledCourses } = useContext(AppContext);
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const [hasGreeted, setHasGreeted] = useState(false);
  const location = useLocation();
  const [learningContext, setLearningContext] = useState(null);

  // Persistence State
  const [sessionId, setSessionId] = useState(() => {
    const saved = localStorage.getItem('chat_session_id');
    if (saved) return saved;
    const generateId = () => Math.random().toString(36).substring(2, 11) + Date.now().toString(36).substring(4);
    const newId = `session-${generateId()}`;
    localStorage.setItem('chat_session_id', newId);
    return newId;
  });

  // Registration state machine
  const [regState, setRegState] = useState('idle'); // idle | awaiting_name | awaiting_email | registered
  const [collectedName, setCollectedName] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ── Load Status & History ──
  useEffect(() => {
    const initChat = async () => {
      try {
        const { data: statusData } = await api.get('/chat/status');
        setEnabled(statusData.enabled);
        if (!statusData.enabled) return;

        const { data: historyData } = await api.get(`/chat/history/${sessionId}`);
        if (historyData.success && historyData.messages?.length > 0) {
          setMessages(historyData.messages.map(m => ({
            ...m,
            timestamp: m.timestamp || Date.now()
          })));
          setHasGreeted(true);
          setRegState('registered');
        }
      } catch (error) {
        console.error('Chat initialization failure', error);
      }
    };
    initChat();
  }, [sessionId]);

  // ── Sync user identity ──
  useEffect(() => {
    if (user && regState !== 'registered') {
      setRegState('registered');
      setCollectedName(user.name);
      setRegisteredEmail(user.email);
    }
  }, [user, regState]);

  // ── Detect Context from URL ──
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const lectureId = params.get('lec');

    if (location.pathname.includes('/player/')) {
      const courseId = location.pathname.split('/player/')[1]?.split('/')[0];
      const course = enrolledCourses.find(c => c.courseId?._id === courseId)?.courseId ||
        enrolledCourses.find(c => c._id === courseId);

      let lectureTitle = '';
      let lectureDescription = '';
      if (course && lectureId) {
        course.courseContent?.forEach(chapter => {
          const lec = chapter.chapterContent?.find(l => l._id === lectureId || l.lectureId === lectureId);
          if (lec) {
            lectureTitle = lec.lectureTitle;
            lectureDescription = lec.lectureDescription;
          }
        });
      }

      setLearningContext({
        type: 'player',
        courseId,
        courseTitle: course?.courseTitle || 'Active Course',
        lectureId,
        lectureTitle,
        lectureDescription,
        activity: lectureTitle ? `Analyzing: ${lectureTitle}` : "Studying Course Content"
      });
    } else if (location.pathname.includes('/course/')) {
      const courseId = location.pathname.split('/course/')[1]?.split('/')[0];
      const course = allCourses.find(c => c._id === courseId);

      setLearningContext({
        type: 'catalog',
        courseId,
        courseTitle: course?.courseTitle || 'Course Catalog',
        activity: "Exploring Courses"
      });
    } else {
      setLearningContext(null);
    }
  }, [location.pathname, location.search, enrolledCourses, allCourses]);

  // ── Auto-scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // ── Increment unread when closed ──
  useEffect(() => {
    if (!open && messages.length > 0 && messages[messages.length - 1]?.role === 'bot') {
      setUnread(prev => prev + 1);
    }
  }, [messages, open]);

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
          if (user) {
            addBotMessage(
              `👋 Welcome back, **${user.name.split(' ')[0]}**! I am **PrismBot**, your AI assistant.\n\nI've synchronized with your learning data. How can I assist you today?`
            );
            setRegState('registered');
          } else {
            addBotMessage(
              "👋 Hello! I am **PrismBot**, your AI learning assistant.\n\nTo assist you better and personalize your experience, may I know your **full name**?"
            );
            setRegState('awaiting_name');
          }
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

      if (regState === 'awaiting_email') {
        if (!emailRegex.test(text)) {
          setTyping(false);
          addBotMessage("⚠️ That doesn't look like a valid email. Please enter a valid email address (e.g. john@example.com).");
          return;
        }
        const { data } = await api.post('/chat/register-user', { name: collectedName, email: text });
        setTyping(false);
        if (data.alreadyExists) {
          setRegisteredEmail(text);
          setRegState('registered');
          addBotMessage(`Welcome back, **${collectedName}**! How can I help you today? ✨`);
        } else if (data.success) {
          setRegisteredEmail(text);
          setRegState('registered');
          addBotMessage(
            `Welcome, **${collectedName}**! 🎉\n\nI have registered your interest. Your login credentials have also been sent to **${text}**.\n\nInterested in any particular subject?`,
            { emailPreviewUrl: data.emailPreviewUrl }
          );
        } else {
          addBotMessage(`❌ Encountered an issue: ${data.message}`);
        }
        return;
      }

      const courseKeywords = ['course', 'learn', 'study', 'class', 'program', 'training', 'certificate', 'skill'];
      const isCourseQuery = courseKeywords.some(k => text.toLowerCase().includes(k)) && text.length < 40;

      if (isCourseQuery) {
        const searchTerm = text.replace(/course|courses|about|for|in|on|learn|study|i want|want/gi, '').trim();
        const { data: courseData } = await api.get(`/chat/courses?q=${encodeURIComponent(searchTerm || text)}&email=${encodeURIComponent(registeredEmail || user?.email || '')}&name=${encodeURIComponent(collectedName || user?.name || '')}`);
        setTyping(false);
        if (courseData.courses?.length > 0) {
          addBotMessage(`🎓 Great! Based on your interest, here are some recommended courses:`, { type: 'courses', courses: courseData.courses });
        } else {
          addBotMessage(`Currently, this specific module is in development. I've recorded your interest! 📋`);
        }
        return;
      }

      const history = buildHistory(messages, text);
      const payload = { message: text, history, context: learningContext, userRole: user?.role || 'guest', userName: user?.name || collectedName || 'Scholar', sessionId: sessionId };
      const { data } = await api.post('/chat/message', payload);
      setTyping(false);
      const resolvedChatText = data?.text || data?.result?.text || data?.data?.text || null;
      if (resolvedChatText) addBotMessage(resolvedChatText);
      else addBotMessage("The AI service responded without a message. Please retry after restarting the backend server.");

      if (data.offerEscalation && user) {
        addBotMessage("Would you like me to **create a support ticket** for this?", {
          type: 'action',
          actionLabel: 'Escalate to Support',
          onAction: async () => {
            setTyping(true);
            try {
              const res = await api.post('/chat/escalate', { summary: text });
              setTyping(false);
              if (res.data.success) addBotMessage(`Ticket created (#${res.data.ticket._id.substring(18)}).`);
            } catch (e) {
              setTyping(false);
              addBotMessage("Failed to create ticket.");
            }
          }
        });
      }
    } catch (error) {
      setTyping(false);
      addBotMessage(error.response?.data?.message || error.response?.data?.text || "Connectivity issue. Please try again.");
    }
  };

  const handlePurgeHistory = async () => {
    // NATIVE PROMPT
    const proceed = window.confirm("Clear all messages and recalibrate neural link?");
    if (!proceed) return;

    try {
      await api.delete(`/chat/session/${sessionId}`);
      setMessages([]);
      setHasGreeted(false);
      const newId = `session-${Math.random().toString(36).substring(2, 11)}${Date.now().toString(36).substring(4)}`;
      localStorage.setItem('chat_session_id', newId);
      setSessionId(newId);
      toast.success('Neural link recalibrated (History Purged)');
    } catch (err) {
      toast.error('Purge protocol failure');
    }
  };

  const quickReplies = user?.role === 'admin' ? [
    { label: '• Health Summary', msg: 'System health summary' },
    { label: '• Approvals', msg: 'Pending approvals' }
  ] : [
    { label: '• Progress', msg: 'Show my progress' },
    { label: '• Help', msg: 'I need platform help' }
  ];

  if (!enabled) return null;

  return (
    <>
      <button onClick={open ? () => setOpen(false) : handleOpen} className="fixed bottom-6 right-6 z-[9998] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center bg-gradient-to-br from-emerald-600 to-teal-600 hover:scale-110 transition-all">
        {open ? <span className="text-white text-xl font-bold">×</span> : <span className="text-2xl">🤖</span>}
        {!open && unread > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg">{unread}</span>}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-[9999] w-[380px] h-[600px] flex flex-col rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10" style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #13132a 100%)', backdropFilter: 'blur(30px)' }}>
          <div className="flex items-center gap-3 px-6 py-5 bg-white/5 border-b border-white/10">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/20">🤖</div>
            <div className="flex-1">
              <h3 className="text-white font-black text-sm">PrismBot</h3>
              <p className="text-gray-400 text-[10px] font-bold">Synchronized</p>
            </div>
            {/* PURGE BUTTON - PLAIN DIV FOR MAXIMUM RELIABILITY */}
            <div
              id="chatbot-purge-btn"
              onClick={handlePurgeHistory}
              className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-red-500/20 rounded-full cursor-pointer transition-colors"
            >
              <span className="text-gray-400 hover:text-red-400 text-lg pointer-events-none">🗑️</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2 min-h-0 scrollbar-none">
            {messages.length === 0 && !typing && (
              <div className="text-center py-12 px-6">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6"><span className="text-4xl">🎓</span></div>
                <h4 className="text-white font-black text-lg">AI Assistant</h4>
                <p className="text-gray-500 text-xs">Ask me anything about your learning journey.</p>
              </div>
            )}
            {messages.map((msg, i) => <Message key={i} msg={msg} />)}
            {typing && (
              <div className="flex justify-start mb-3">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs mr-2 flex-shrink-0">🤖</div>
                <div className="bg-white/5 border border-white/10 rounded-2xl"><TypingDots /></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-5 py-5 border-t border-white/10 flex items-end gap-3 bg-black/40">
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Ask PrismBot…" rows={1} className="flex-1 bg-white/5 border border-white/10 text-white text-sm rounded-2xl px-5 py-3 resize-none focus:outline-none focus:border-emerald-500 transition-all" style={{ maxHeight: '120px', minHeight: '48px' }} />
            <button onClick={handleSend} disabled={!input.trim() || typing} className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center transition-all disabled:opacity-30">
              <span className="font-bold">→</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
