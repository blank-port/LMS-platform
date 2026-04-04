import React, { useContext } from 'react'
import { Outlet } from 'react-router-dom'
import SideBar from '../../components/educator/SideBar'
import Navbar from '../../components/educator/Navbar'
import Footer from '../../components/educator/Footer'
import { AppContext } from '../../context/AppContextObject.jsx'

const Educator = () => {
  const { user, navigate } = useContext(AppContext);

  if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] p-6">
        <div className="text-center max-w-md p-10 glass-morph rounded-[3rem] shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-700">
          <div className="w-24 h-24 bg-gradient-to-tr from-slate-900 to-indigo-900 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-500/10 scale-110">
            <span className="text-5xl">🔒</span>
          </div>
          <h2 className="text-3xl font-black text-slate-950 mb-4 tracking-tighter">Studio Access Required</h2>
          <p className="text-slate-500 mb-10 leading-relaxed font-bold text-xs uppercase tracking-widest opacity-60">Valid instructor credentials are required to interface with the Educator Studio.</p>
          <button onClick={() => navigate('/login')} className="bg-slate-900 text-white w-full rounded-2xl h-16 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-500/10">
            Authenticate Identity
          </button>
        </div>
      </div>
    );
  }

  // Institutional Authorization Layer: Pending Approval Check
  if (user.role === 'instructor' && !user.isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-8">
        <div className="text-center max-w-lg p-16 bg-white rounded-[4rem] shadow-[0_40px_100px_rgba(15,23,42,0.05)] border border-gray-100 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="relative mx-auto mb-12 w-32 h-32">
            <div className="absolute inset-0 bg-amber-500/10 rounded-[2.5rem] animate-pulse"></div>
            <div className="relative w-full h-full bg-white border-4 border-amber-500 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-amber-500/20">
              <span className="text-6xl animate-bounce duration-1000">⏳</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Authorization Pending</p>
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tighter">Scholarly Verification</h2>
            <p className="text-slate-400 mb-12 leading-relaxed text-sm font-medium">Your credentials have been logged in the institutional repository. Administration is currently analyzing your pedagogical status. You will have full access to the studio once verified.</p>
            
            <div className="flex flex-col gap-4">
              <button onClick={() => window.location.reload()} className="bg-slate-900 text-white w-full rounded-3xl h-20 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-500 transition-all shadow-2xl shadow-slate-900/10">
                Check Authorization Pulse
              </button>
              <button onClick={() => navigate('/')} className="text-slate-400 w-full h-16 text-[10px] font-black uppercase tracking-[0.2em] hover:text-slate-900 transition-all">
                Return to Campus
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] instructor-theme animate-fade-in">
      <Navbar />
      <div className="flex pt-20">
        <SideBar />
        <main className="flex-1 md:ml-72 p-8 sm:p-12 lg:p-16 text-[var(--text-main)] overflow-x-hidden">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default Educator
