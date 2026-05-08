import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { signIn } from '../../services/authService'
import { Button } from '../UI/Button'
import { GlassCard } from '../UI/GlassCard'
import { siteConfig } from '../../config/siteConfig'
import { AuthorCredit } from '../UI/AuthorCredit'
import { ParticlesBackground } from '../UI/ParticlesBackground'

const schema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少 6 位'),
})
type FormData = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setServerError(null)
    const result = await signIn(data.email, data.password)
    if (result.error) {
      setServerError(result.error)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-dreamy flex items-center justify-center p-4">
      <ParticlesBackground />

      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-pink-200/40 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-purple-200/40 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-rose-200/30 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.div
            className="mb-4 text-5xl animate-float inline-block"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            🌍
          </motion.div>
          <h1 className="text-3xl font-bold text-pink-700">{siteConfig.name}</h1>
          <p className="mt-1 text-pink-400 text-sm">记录我们一起走过的地方</p>
        </div>

        <GlassCard className="p-8">
          <h2 className="mb-6 text-xl font-semibold text-pink-800">登录账户</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-pink-700">邮箱</label>
              <input
                type="email"
                autoComplete="email"
                placeholder="your@email.com"
                className="w-full rounded-xl border border-pink-200 bg-white/60 px-4 py-2.5 text-sm text-gray-700 placeholder-pink-300 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition"
                {...register('email')}
              />
              {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-pink-700">密码</label>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-pink-200 bg-white/60 px-4 py-2.5 text-sm text-gray-700 placeholder-pink-300 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition"
                {...register('password')}
              />
              {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>}
            </div>

            {serverError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-600">
                {serverError}
              </div>
            )}

            <Button type="submit" loading={isSubmitting} className="w-full mt-2">
              登录 ✨
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-pink-500">
            还没有账户？{' '}
            <Link to="/register" className="font-medium text-pink-600 hover:text-pink-700 underline underline-offset-2">
              立即注册
            </Link>
          </p>
        </GlassCard>

        <p className="mt-6 text-center text-xs text-pink-400">
          Our Journey Around the World 💕
        </p>
        <AuthorCredit className="mt-2" />
      </motion.div>
    </div>
  )
}
