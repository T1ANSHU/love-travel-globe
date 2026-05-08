import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { signUp } from '../../services/authService'
import { Button } from '../UI/Button'
import { GlassCard } from '../UI/GlassCard'
import { AuthorCredit } from '../UI/AuthorCredit'

const schema = z.object({
  displayName: z.string().min(2, '昵称至少 2 个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少 6 位'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setServerError(null)
    const result = await signUp(data.email, data.password, data.displayName)
    if (result.error) {
      setServerError(result.error)
      return
    }
    // Some Supabase projects require email confirmation — handle both cases
    if (result.session) {
      navigate('/')
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-dreamy flex items-center justify-center p-4">
        <GlassCard className="p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">💌</div>
          <h2 className="text-xl font-semibold text-pink-800 mb-2">注册成功！</h2>
          <p className="text-pink-500 text-sm">
            请查看您的邮箱，点击确认链接后即可登录。
          </p>
          <Link to="/login" className="mt-6 inline-block text-pink-600 text-sm underline underline-offset-2">
            返回登录
          </Link>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dreamy flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-pink-200/40 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-purple-200/40 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <motion.div
            className="mb-4 text-5xl animate-float inline-block"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            🌸
          </motion.div>
          <h1 className="text-3xl font-bold text-pink-700">创建你们的旅行地球</h1>
          <p className="mt-1 text-pink-400 text-sm">开始记录你们共同的旅行故事</p>
        </div>

        <GlassCard className="p-8">
          <h2 className="mb-6 text-xl font-semibold text-pink-800">注册账户</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-pink-700">昵称</label>
              <input
                type="text"
                autoComplete="nickname"
                placeholder="你的旅行者昵称"
                className="w-full rounded-xl border border-pink-200 bg-white/60 px-4 py-2.5 text-sm text-gray-700 placeholder-pink-300 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition"
                {...register('displayName')}
              />
              {errors.displayName && <p className="mt-1 text-xs text-rose-500">{errors.displayName.message}</p>}
            </div>

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
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-pink-200 bg-white/60 px-4 py-2.5 text-sm text-gray-700 placeholder-pink-300 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition"
                {...register('password')}
              />
              {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-pink-700">确认密码</label>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-pink-200 bg-white/60 px-4 py-2.5 text-sm text-gray-700 placeholder-pink-300 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && <p className="mt-1 text-xs text-rose-500">{errors.confirmPassword.message}</p>}
            </div>

            {serverError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-600">
                {serverError}
              </div>
            )}

            <Button type="submit" loading={isSubmitting} className="w-full mt-2">
              开始旅行 🌍
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-pink-500">
            已有账户？{' '}
            <Link to="/login" className="font-medium text-pink-600 hover:text-pink-700 underline underline-offset-2">
              直接登录
            </Link>
          </p>
        </GlassCard>
        <AuthorCredit className="mt-4" />
      </motion.div>
    </div>
  )
}
