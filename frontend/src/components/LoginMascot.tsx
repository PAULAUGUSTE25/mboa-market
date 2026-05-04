import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export type MascotState = 'idle' | 'watching' | 'covering' | 'excited' | 'sad' | 'happy';

interface Props { state: MascotState; }

export default function LoginMascot({ state }: Props) {
  const excited = state === 'excited' || state === 'happy';
  const sad = state === 'sad';
  const cover = state === 'covering';
  const watch = state === 'watching';

  const [blink, setBlink] = useState(false);
  useEffect(() => {
    const t = setInterval(() => { setBlink(true); setTimeout(() => setBlink(false), 180); }, 3200);
    return () => clearInterval(t);
  }, []);

  // Body bounce (whole container)
  const bodyAnim: any = excited
    ? { y: [0, -22, 0], scaleY: [1, 1.08, 1], transition: { duration: 0.4, repeat: Infinity } }
    : sad
    ? { y: [0, 3, 0], rotate: [0, 3, 0], transition: { duration: 2.5, repeat: Infinity } }
    : { y: [0, -4, 0], transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } };

  // Legs walk cycle
  const legL: any = excited ? { rotate: [0, 18, 0], y: [0, -6, 0], transition: { duration: 0.35, repeat: Infinity } }
    : sad ? { rotate: [0, 5, 0], transition: { duration: 2.5, repeat: Infinity } }
    : { rotate: [0, 6, 0], y: [0, -2, 0], transition: { duration: 0.7, repeat: Infinity, ease: 'easeInOut' } };
  const legR: any = excited ? { rotate: [0, -18, 0], y: [0, -6, 0], transition: { duration: 0.35, repeat: Infinity, delay: 0.17 } }
    : sad ? { rotate: [0, -5, 0], transition: { duration: 2.5, repeat: Infinity } }
    : { rotate: [0, -6, 0], y: [0, -2, 0], transition: { duration: 0.7, repeat: Infinity, ease: 'easeInOut', delay: 0.35 } };

  // Arms
  const armL: any = excited ? { rotate: [0, -40, 0], y: [0, -10, 0], transition: { duration: 0.4, repeat: Infinity } }
    : cover ? { rotate: [0, -55, 0], transition: { duration: 0.25 } }
    : sad ? { rotate: [0, 12, 0], transition: { duration: 2.5, repeat: Infinity } }
    : { rotate: [0, -12, 0], transition: { duration: 1.3, repeat: Infinity, ease: 'easeInOut' } };
  const armR: any = excited ? { rotate: [0, 40, 0], y: [0, -10, 0], transition: { duration: 0.4, repeat: Infinity, delay: 0.1 } }
    : cover ? { rotate: [0, 55, 0], transition: { duration: 0.25, delay: 0.08 } }
    : sad ? { rotate: [0, -12, 0], transition: { duration: 2.5, repeat: Infinity } }
    : { rotate: [0, 12, 0], transition: { duration: 1.3, repeat: Infinity, ease: 'easeInOut', delay: 0.3 } };

  // Head
  const headAnim: any = excited ? { rotate: [0, -4, 4, 0], y: [0, -3, 0], transition: { duration: 0.4, repeat: Infinity } }
    : sad ? { rotate: [0, 6, 0], y: [0, 2, 0], transition: { duration: 2.5, repeat: Infinity } }
    : watch ? { rotate: [0, 5, -5, 0], transition: { duration: 1.2, repeat: Infinity } }
    : { rotate: [0, 2, -2, 0], transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' } };

  // Hat wobble
  const hatAnim: any = excited ? { rotate: [0, -8, 8, 0], y: [0, -6, 0], transition: { duration: 0.35, repeat: Infinity } }
    : { rotate: [0, 2, -2, 0], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } };

  return (
    <motion.div className="w-36 h-44 relative" animate={bodyAnim} style={{ originX: 0.5, originY: 1 }}>
      <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
        {/* Ground shadow */}
        <ellipse cx="100" cy="232" rx="42" ry="5" fill="rgba(0,0,0,0.12)" />

        {/* === LEGS === */}
        <motion.g style={{ originX: '76px', originY: '180px' }} animate={legL}>
          <ellipse cx="76" cy="202" rx="14" ry="22" fill="#4A6741" stroke="#2D3D28" strokeWidth="2" />
          <ellipse cx="76" cy="220" rx="18" ry="8" fill="#3D2B15" />
        </motion.g>
        <motion.g style={{ originX: '124px', originY: '180px' }} animate={legR}>
          <ellipse cx="124" cy="202" rx="14" ry="22" fill="#4A6741" stroke="#2D3D28" strokeWidth="2" />
          <ellipse cx="124" cy="220" rx="18" ry="8" fill="#3D2B15" />
        </motion.g>

        {/* === BODY / Overalls === */}
        <g>
          <rect x="66" y="132" width="68" height="72" rx="22" fill="#5A7A4F" stroke="#3D5237" strokeWidth="2.5" />
          {/* Straps */}
          <rect x="74" y="118" width="10" height="28" rx="4" fill="#3D5237" />
          <rect x="116" y="118" width="10" height="28" rx="4" fill="#3D5237" />
          {/* Buttons */}
          <circle cx="79" cy="136" r="4" fill="#D4A843" />
          <circle cx="121" cy="136" r="4" fill="#D4A843" />
          {/* Pocket */}
          <rect x="84" y="150" width="32" height="24" rx="6" fill="#4A6741" stroke="#3D5237" strokeWidth="1.5" />
          <circle cx="100" cy="160" r="3" fill="#D4A843" />
        </g>

        {/* === ARMS === */}
        <motion.g style={{ originX: '66px', originY: '142px' }} animate={armL}>
          <path d="M66 142 Q44 166 42 188" fill="none" stroke="#5A7A4F" strokeWidth="14" strokeLinecap="round" />
          <circle cx="42" cy="192" r="11" fill="#8B6914" />
        </motion.g>
        <motion.g style={{ originX: '134px', originY: '142px' }} animate={armR}>
          <path d="M134 142 Q156 166 158 188" fill="none" stroke="#5A7A4F" strokeWidth="14" strokeLinecap="round" />
          <circle cx="158" cy="192" r="11" fill="#8B6914" />
        </motion.g>

        {/* === HEAD === */}
        <motion.g style={{ originX: '100px', originY: '118px' }} animate={headAnim}>
          {/* Neck */}
          <rect x="90" y="112" width="20" height="14" rx="5" fill="#8B6914" />
          {/* Head circle */}
          <circle cx="100" cy="78" r="42" fill="#8B6914" />
          {/* Ears */}
          <ellipse cx="56" cy="78" rx="7" ry="12" fill="#7A5E10" />
          <ellipse cx="144" cy="78" rx="7" ry="12" fill="#7A5E10" />

          {/* Hair */}
          <g fill="#1A1A1A">
            <circle cx="78" cy="38" r="8" /><circle cx="100" cy="32" r="10" />
            <circle cx="122" cy="38" r="8" /><circle cx="68" cy="50" r="7" />
            <circle cx="132" cy="50" r="7" /><circle cx="88" cy="28" r="6" />
            <circle cx="112" cy="28" r="6" />
          </g>

          {/* === HAT === */}
          <motion.g style={{ originX: '100px', originY: '34px' }} animate={hatAnim}>
            <ellipse cx="100" cy="34" rx="56" ry="7" fill="#D4A843" stroke="#B08D2F" strokeWidth="2.5" />
            <path d="M64 34 L72 8 Q100 2 128 8 L136 34" fill="#C49A3B" stroke="#B08D2F" strokeWidth="2.5" />
            <path d="M68 26 Q100 30 132 26" fill="none" stroke="#8B6914" strokeWidth="3.5" />
          </motion.g>

          {/* === FACE === */}
          <AnimatePresence mode="wait">
            {sad ? (
              <motion.g key="sad" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Eyes - downturned */}
                <ellipse cx="84" cy="72" rx="9" ry="8" fill="white" />
                <circle cx="84" cy="74" r="5" fill="#3D5237" />
                <ellipse cx="116" cy="72" rx="9" ry="8" fill="white" />
                <circle cx="116" cy="74" r="5" fill="#3D5237" />
                {/* Tears */}
                <motion.circle cx="76" cy="84" r="3" fill="#4A9FD4" animate={{ y: [0, 14], opacity: [1, 0] }} transition={{ duration: 1.2, repeat: Infinity }} />
                <motion.circle cx="124" cy="84" r="3" fill="#4A9FD4" animate={{ y: [0, 14], opacity: [1, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }} />
                {/* Mouth sad */}
                <path d="M84 96 Q100 88 116 96" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
                {/* Eyebrows sad */}
                <path d="M78 62 L90 66" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
                <path d="M122 62 L110 66" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
              </motion.g>
            ) : excited ? (
              <motion.g key="happy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Eyes - happy arcs */}
                <path d="M76 70 Q84 62 92 70" fill="none" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
                <path d="M108 70 Q116 62 124 70" fill="none" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
                {/* Mouth big smile */}
                <path d="M78 92 Q100 110 122 92" fill="none" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
                {/* Cheeks */}
                <ellipse cx="72" cy="88" rx="8" ry="4" fill="rgba(255,100,100,0.25)" />
                <ellipse cx="128" cy="88" rx="8" ry="4" fill="rgba(255,100,100,0.25)" />
              </motion.g>
            ) : blink ? (
              <motion.g key="blink" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <path d="M78 72 Q84 76 90 72" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M110 72 Q116 76 122 72" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
                {/* Nose */}
                <ellipse cx="100" cy="80" rx="5" ry="4" fill="#6B5310" />
                {/* Mouth */}
                <path d="M86 94 Q100 100 114 94" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
                {/* Cheeks */}
                <ellipse cx="74" cy="88" rx="7" ry="4" fill="rgba(255,100,100,0.2)" />
                <ellipse cx="126" cy="88" rx="7" ry="4" fill="rgba(255,100,100,0.2)" />
              </motion.g>
            ) : (
              <motion.g key="open" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Eyes */}
                <ellipse cx="84" cy="72" rx="9" ry="11" fill="white" />
                <circle cx="84" cy="72" r="6" fill="#3D5237" />
                <circle cx="86" cy="70" r="2.5" fill="white" />
                <ellipse cx="116" cy="72" rx="9" ry="11" fill="white" />
                <circle cx="116" cy="72" r="6" fill="#3D5237" />
                <circle cx="118" cy="70" r="2.5" fill="white" />
                {/* Nose */}
                <ellipse cx="100" cy="80" rx="5" ry="4" fill="#6B5310" />
                {/* Mouth */}
                <path d={watch ? "M88 96 Q100 104 112 96" : "M88 94 Q100 100 112 94"} fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
                {/* Cheeks */}
                <ellipse cx="74" cy="88" rx="7" ry="4" fill="rgba(255,100,100,0.2)" />
                <ellipse cx="126" cy="88" rx="7" ry="4" fill="rgba(255,100,100,0.2)" />
              </motion.g>
            )}
          </AnimatePresence>
        </motion.g>
      </svg>
    </motion.div>
  );
}
