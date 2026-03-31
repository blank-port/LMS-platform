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
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <div className="text-center max-w-md p-10 glass-morph rounded-[3rem] shadow-2xl border border-white/20">
          <div className="w-24 h-24 bg-gradient-to-tr from-slate-900 to-indigo-900 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-500/10">
            <span className="text-5xl">🔒</span>
          </div>
          <h2 className="text-3xl font-black text-slate-950 mb-4 tracking-tight">Studio Access Required</h2>
          <p className="text-slate-500 mb-10 leading-relaxed font-medium">Valid instructor credentials are required to interface with the Educator Studio.</p>
          <button onClick={() => navigate('/login')} className="btn-premium w-full !rounded-2xl h-16 text-sm uppercase tracking-[0.2em]">
            Authenticate Identity
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] overflow-x-hidden">
      <Navbar />
      <div className="flex pt-20">
        <SideBar />
        <main className="flex-1 md:ml-72 p-8 sm:p-12 lg:p-16 animate-fade-in">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default Educator
