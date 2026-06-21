'use client';

import { motion } from 'framer-motion';

interface SkillCardProps {
  skill: string;
  masteryPercent: number;
  level: 'weak' | 'moderate' | 'strong';
  index?: number;
}

const levelConfig = {
  weak:     { color: '#f43f5e', bg: 'rgba(244,63,94,0.08)',   border: 'rgba(244,63,94,0.20)',  badge: 'badge-weak',     label: 'Needs Work' },
  moderate: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.20)', badge: 'badge-moderate', label: 'Developing' },
  strong:   { color: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.20)', badge: 'badge-strong',   label: 'Mastered'   },
};

/* Circular SVG ring */
function CircleProgress({ percent, color, size = 52 }: { percent: number; color: string; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;

  return (
    <svg width={size} height={size} className="flex-shrink-0">
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={5}
      />
      {/* Progress */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
        filter={`drop-shadow(0 0 4px ${color}60)`}
      />
      {/* Percent text */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontWeight={700}
        fill={color}
        fontFamily="Inter, system-ui, sans-serif"
      >
        {percent}
      </text>
    </svg>
  );
}

export default function SkillCard({ skill, masteryPercent, level, index = 0 }: SkillCardProps) {
  const cfg = levelConfig[level];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: 'easeOut' }}
      whileHover={{ y: -2, scale: 1.015 }}
      className="group relative rounded-xl p-4 transition-all duration-200 cursor-default"
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
      }}
    >
      {/* Subtle shine on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative flex items-center gap-4">
        <CircleProgress percent={masteryPercent} color={cfg.color} />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-600 text-[var(--text-primary)] truncate" style={{ fontWeight: 600 }}>
            {skill}
          </h3>
          <div className="mt-1.5 flex items-center justify-between">
            <span className={`badge ${cfg.badge} text-[9px]`} style={{ padding: '2px 7px' }}>
              {cfg.label}
            </span>
            <span className="text-xs text-[var(--text-muted)] tabular-nums">
              {masteryPercent}%
            </span>
          </div>
          {/* Mini progress bar */}
          <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${masteryPercent}%` }}
              transition={{ duration: 1.0, ease: 'easeOut', delay: 0.4 + index * 0.04 }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${cfg.color}cc, ${cfg.color})` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
