import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'

interface IntroAnimationProps {
  onComplete: () => void
}

export function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [phase, setPhase] = useState<'fade-in' | 'text' | 'done'>('fade-in')
  const user = useAuthStore((s) => s.user)
  const displayName = user?.user_metadata?.display_name ?? '旅行者'

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('text'), 800)
    const t2 = setTimeout(() => setPhase('done'), 3200)
    const t3 = setTimeout(() => onComplete(), 3800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onComplete])

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          className="fixed inset-0 z-50 bg-dreamy flex flex-col items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="text-7xl mb-6"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 160 }}
          >
            🌍
          </motion.div>

          <AnimatePresence>
            {phase === 'text' && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-2xl font-bold text-pink-700">
                  欢迎回来，{displayName} 💕
                </p>
                <p className="mt-2 text-pink-400 text-sm">Our Journey Around the World</p>
                <p className="mt-1 text-pink-400 text-sm">记录我们一起走过的地方</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
