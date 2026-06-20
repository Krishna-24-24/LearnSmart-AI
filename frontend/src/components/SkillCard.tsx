interface SkillCardProps {
  skill: string;
  masteryPercent: number;
  level: 'weak' | 'moderate' | 'strong';
}

const levelColors = {
  weak: { bar: 'bg-rose-500', text: 'text-rose-400', bg: 'bg-rose-500/10' },
  moderate: { bar: 'bg-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10' },
  strong: { bar: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
};

export default function SkillCard({ skill, masteryPercent, level }: SkillCardProps) {
  const colors = levelColors[level];

  return (
    <div className={`rounded-xl border border-slate-800 ${colors.bg} p-4 transition hover:border-slate-700`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium text-white">{skill}</h3>
        <span className={`text-sm font-semibold ${colors.text}`}>{masteryPercent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
          style={{ width: `${masteryPercent}%` }}
        />
      </div>
    </div>
  );
}
