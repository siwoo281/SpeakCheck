import React from 'react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="relative w-full h-screen max-w-md mx-auto bg-gradient-to-br from-[#0A0A0A] via-[#0D1117] to-[#0A0A0A] flex flex-col shadow-2xl overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-20 -left-20 w-72 h-72 bg-teal-start/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-end/5 rounded-full blur-[80px]" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:14px_24px]" />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 z-10 w-full relative py-8">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center mb-16 animate-enter w-full">
          {/* Icon with Glassmorphism */}
          <div className="relative mb-10 group cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-start/30 to-teal-end/30 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl group-hover:scale-105 transition-transform duration-500">
              <span 
                className="material-symbols-outlined text-[64px] bg-gradient-to-br from-teal-start via-teal-end to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(45,212,191,0.6)]"
                style={{ fontVariationSettings: "'wght' 200, 'FILL' 0" }}
              >
                sound_sampler
              </span>
            </div>
          </div>

          {/* Title Section with Modern Typography */}
          <div className="space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 backdrop-blur-sm mb-3">
              <span className="text-teal-300 text-xs font-semibold tracking-wider uppercase">StageReady</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-tight text-white px-4 tracking-tight">
              <span className="block mb-2 text-gray-400 text-2xl font-normal tracking-wide">프레젠테이션은</span>
              <span className="bg-gradient-to-r from-teal-start via-teal-end to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(45,212,191,0.3)]">
                청중과의 소통
              </span>
              <span className="text-white">이다</span>
            </h1>
            <p className="text-gray-400 text-sm font-normal pt-2 max-w-[280px] mx-auto leading-relaxed">
              무대에 오르기 전,<br />
              <span className="text-teal-300/80">편안한 마음</span>으로 목소리를 다듬어보세요.
            </p>
          </div>
        </div>

        {/* CTA Button with Modern Design */}
        <div className="w-full px-2 flex flex-col items-center animate-enter delay-200">
          <button 
            onClick={onStart}
            className="group relative w-full max-w-[300px] overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 active:scale-95"
          >
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-start via-teal-end to-cyan-300 opacity-100 group-hover:opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 via-teal-end to-teal-start opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Button Content */}
            <div className="relative px-8 py-4 flex items-center justify-center gap-3">
              <span className="text-black font-bold text-base tracking-wide">준비 시작</span>
              <span className="material-symbols-outlined text-lg text-black group-hover:translate-x-1 transition-transform duration-300">
                arrow_forward
              </span>
            </div>
            
            {/* Shine Effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </button>
          
          <div className="mt-5 flex items-center gap-2">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-gray-700" />
            <p className="text-[10px] text-gray-600 font-semibold tracking-[0.2em] uppercase">
              성공적인 스피치를 위하여
            </p>
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-gray-700" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
