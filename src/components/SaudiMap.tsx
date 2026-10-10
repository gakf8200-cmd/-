import React, { useState } from 'react';
import { Branch, SystemData } from '../types';
import { MapPin, Building2, Users, Wrench, ShieldAlert, ArrowUpRight } from 'lucide-react';

interface SaudiMapProps {
  branches: Branch[];
  systemData: SystemData;
  selectedBranchId: string;
  onSelectBranch: (branchId: string) => void;
}

export const SaudiMap: React.FC<SaudiMapProps> = ({
  branches,
  systemData,
  selectedBranchId,
  onSelectBranch,
}) => {
  const [hoveredBranchId, setHoveredBranchId] = useState<string | null>(null);

  // Approximate relative coordinates calibrated for Saudi Arabia territory map
  const branchMapPositions: Record<string, { top: string; left: string }> = {
    'branch-riyadh': { top: '48%', left: '55%' },
    'branch-makkah': { top: '62%', left: '27%' },
    'branch-alaya': { top: '74%', left: '33%' },
    'branch-namas': { top: '78%', left: '34%' },
    'branch-abha': { top: '84%', left: '36%' },
  };

  const getBranchStats = (bId: string) => {
    const workers = systemData.workers.filter((w) => w.branchId === bId).length;
    const equipment = systemData.equipment.filter((e) => e.branchId === bId).length;
    const maintenance = systemData.maintenanceReports.filter(
      (m) => m.branchId === bId && m.status !== 'مكتمل'
    ).length;
    const projects = systemData.projects.filter((p) => p.branchId === bId).length;
    return { workers, equipment, maintenance, projects };
  };

  const activeBranch = branches.find((b) => b.id === (hoveredBranchId || selectedBranchId));
  const activeStats = activeBranch ? getBranchStats(activeBranch.id) : null;

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
            <MapPin className="w-5 h-5" />
            <span>خريطة التوزيع الجغرافي لفروع ومشاريع الشركة بالمملكة</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            توزيع الفروع الخمسة الرئيسية ومواقع المعدات والفرق الميدانية في المنطقة الوسطى والغربية والجنوبية
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectBranch('ALL')}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
              selectedBranchId === 'ALL'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            عرض كافة الفروع (المركز الرئيسي)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Interactive Map Visual Area */}
        <div className="lg:col-span-8 relative h-[360px] sm:h-[400px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-xl border border-slate-800/80 p-4 flex items-center justify-center overflow-hidden">
          {/* Subtle Grid and Radar Effect */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-25"></div>

          {/* SVG Outline for Saudi Arabia map */}
          <svg
            className="w-full h-full max-h-[360px] object-contain drop-shadow-[0_0_20px_rgba(245,158,11,0.08)]"
            viewBox="0 0 700 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Simplified accurate outline path of Kingdom of Saudi Arabia */}
            <path
              d="M 170 120 
                 L 260 90 
                 L 330 110 
                 L 430 160 
                 L 480 220 
                 L 540 240 
                 L 570 290 
                 L 590 340 
                 L 580 430 
                 L 520 480 
                 L 440 510 
                 L 380 540 
                 L 310 520 
                 L 260 490 
                 L 220 430 
                 L 200 370 
                 L 170 300 
                 L 140 240 
                 L 130 180 Z"
              className="fill-slate-800/40 stroke-amber-500/30"
              strokeWidth="2.5"
              strokeDasharray="4 2"
            />
            {/* Regions highlights */}
            <circle cx="380" cy="270" r="140" className="fill-amber-500/[0.03]" />
            <circle cx="230" cy="390" r="110" className="fill-sky-500/[0.03]" />
            
            {/* Connecting operational lines between central and branches */}
            <line x1="385" y1="288" x2="189" y2="372" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="385" y1="288" x2="252" y2="504" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="189" y1="372" x2="231" y2="444" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="231" y1="444" x2="238" y2="468" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="238" y1="468" x2="252" y2="504" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="1.5" strokeDasharray="3 3" />
          </svg>

          {/* Interactive Branch Markers */}
          {branches.map((branch) => {
            const pos = branchMapPositions[branch.id] || { top: '50%', left: '50%' };
            const isSelected = selectedBranchId === branch.id;
            const isHovered = hoveredBranchId === branch.id;
            const stats = getBranchStats(branch.id);

            return (
              <div
                key={branch.id}
                style={{ top: pos.top, left: pos.left }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                onMouseEnter={() => setHoveredBranchId(branch.id)}
                onMouseLeave={() => setHoveredBranchId(null)}
                onClick={() => onSelectBranch(branch.id)}
              >
                {/* Pulse Ring */}
                <div
                  className={`absolute -inset-2 rounded-full animate-ping opacity-30 ${
                    isSelected ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                />

                {/* Marker Button */}
                <div
                  className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border shadow-lg transition-all transform group-hover:scale-110 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold shadow-amber-500/30'
                      : 'bg-slate-900/90 text-white border-slate-700 hover:border-amber-400/60'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSelected ? 'bg-slate-950' : 'bg-emerald-400'
                    }`}
                  />
                  <span className="text-xs font-semibold whitespace-nowrap">{branch.name}</span>
                </div>

                {/* Mini Quick Tooltip on Hover */}
                {isHovered && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-950/95 border border-slate-700 rounded-lg p-2.5 shadow-2xl text-xs z-30 pointer-events-none">
                    <p className="font-bold text-amber-400 mb-1 border-b border-slate-800 pb-1">
                      {branch.name}
                    </p>
                    <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300">
                      <div>المعدات: <span className="font-bold text-white">{stats.equipment}</span></div>
                      <div>العمال: <span className="font-bold text-white">{stats.workers}</span></div>
                      <div>المشاريع: <span className="font-bold text-white">{stats.projects}</span></div>
                      <div>الصيانة: <span className="font-bold text-rose-400">{stats.maintenance}</span></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Watermark / Direction */}
          <div className="absolute bottom-3 right-3 text-[10px] text-slate-500 pointer-events-none">
            المملكة العربية السعودية · فروع شركة أفق للبنية التحتية
          </div>
        </div>

        {/* Selected Branch Detail Card */}
        <div className="lg:col-span-4 bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between h-[360px] sm:h-[400px]">
          {activeBranch && activeStats ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-amber-400 font-medium px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                    كود الفرع: {activeBranch.code}
                  </span>
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    {activeBranch.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1.5">{activeBranch.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{activeBranch.notes}</p>
              </div>

              {/* Branch Quick Info */}
              <div className="space-y-2 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                <div className="flex justify-between">
                  <span className="text-slate-400">مدير الفرع:</span>
                  <span className="font-medium text-white">{activeBranch.managerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">مسؤول الإدارة:</span>
                  <span className="font-medium text-white">{activeBranch.adminOfficer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">هاتف التواصل:</span>
                  <span className="font-mono text-amber-300" dir="ltr">{activeBranch.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">الموقع:</span>
                  <span className="text-slate-300 truncate max-w-[160px]">{activeBranch.address}</span>
                </div>
              </div>

              {/* Branch Stats Grid */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
                    <Wrench className="w-3.5 h-3.5 text-amber-400" />
                    <span>المعدات</span>
                  </div>
                  <div className="text-lg font-bold text-white">{activeStats.equipment}</div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    <span>العمالة</span>
                  </div>
                  <div className="text-lg font-bold text-white">{activeStats.workers}</div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>المشاريع</span>
                  </div>
                  <div className="text-lg font-bold text-white">{activeStats.projects}</div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>الصيانة المفتوحة</span>
                  </div>
                  <div className="text-lg font-bold text-rose-400">{activeStats.maintenance}</div>
                </div>
              </div>

              <button
                onClick={() => onSelectBranch(activeBranch.id)}
                className="w-full mt-2 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10"
              >
                <span>تصفح وتفصيل بيانات {activeBranch.name}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
              <MapPin className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-sm font-medium">حدد فرعاً من الخريطة لعرض تفاصيله</p>
              <p className="text-xs text-slate-500 mt-1">مكة · الرياض · أبها · العلايا · النماص</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
