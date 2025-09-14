import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Mail, Lock, Eye, EyeOff, User, Phone, MapPin, Building, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Profile } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'

interface SignUpFormProps { onToggleMode: () => void }

export const SignUpForm: React.FC<SignUpFormProps> = ({ onToggleMode }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'recipient' as Profile['role'],
    phone: '',
    address: '',
    city: ''
  })

  const { signUp } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleInput = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }))

  const validate = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.fullName)
      return toast({ title: 'Missing fields', description: 'Fill all required', variant: 'destructive' })
    if (formData.password !== formData.confirmPassword)
      return toast({ title: 'Passwords mismatch', description: 'Check passwords', variant: 'destructive' })
    if (formData.password.length < 6)
      return toast({ title: 'Weak password', description: 'Min 6 chars', variant: 'destructive' })
    return true
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    const { error } = await signUp(
      formData.email,
      formData.password,
      {
        full_name: formData.fullName,
        role: formData.role,
        phone: formData.phone,
        address: formData.address,
        city: formData.city
      }
    )
    setLoading(false)
    if (!error)
      navigate('/signin', { state: { message: 'Account created!' } })
  }

  const roleDesc: Record<Profile['role'], string> = {
    donor: 'Share surplus food with those in need',
    recipient: 'Receive nutritious food donations',
    volunteer: 'Help with food pickup and delivery',
    admin: 'Manage and oversee the platform'
  }

  const roleIcons: Record<Profile['role'], React.ReactNode> = {
    donor: '🍎',
    recipient: '🤝',
    volunteer: '💪',
    admin: '⚙️'
  }

  const passwordStrength = (password: string) => {
    let score = 0
    if (password.length >= 6) score++
    if (password.match(/[a-z]/)) score++
    if (password.match(/[A-Z]/)) score++
    if (password.match(/[0-9]/)) score++
    if (password.match(/[^a-zA-Z0-9]/)) score++
    return score
  }

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 1) return 'bg-red-500'
    if (score <= 2) return 'bg-orange-500'
    if (score <= 3) return 'bg-yellow-500'
    if (score <= 4) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = (score: number) => {
    if (score <= 1) return 'Very Weak'
    if (score <= 2) return 'Weak'
    if (score <= 3) return 'Fair'
    if (score <= 4) return 'Good'
    return 'Strong'
  }

  const strength = passwordStrength(formData.password)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }} 
      animate={{ opacity: 1, y: 0, scale: 1 }} 
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden relative">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 pointer-events-none" />
        
        <CardHeader className="text-center p-8 bg-gradient-to-r from-teal-600 to-emerald-600 text-white relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-white/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 scale-150"></div>
          </div>
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative z-10"
          >
            <CardTitle className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-teal-100 bg-clip-text text-transparent">
              Join NourishSA
            </CardTitle>
            <CardDescription className="text-teal-100 text-lg">
              Create your account to start helping
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="p-8 space-y-6 relative z-10">
          <form onSubmit={submit} className="space-y-6">
            {/* Full Name */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors duration-200" size={20} />
                <Input
                  id="fullName"
                  placeholder="Your full name"
                  className="pl-12 h-12 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-200 bg-gray-50/50 hover:bg-white hover:border-teal-300"
                  value={formData.fullName}
                  onChange={e => handleInput('fullName', e.target.value)}
                  disabled={loading}
                />
              </div>
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors duration-200" size={20} />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-12 h-12 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-200 bg-gray-50/50 hover:bg-white hover:border-teal-300"
                  value={formData.email}
                  onChange={e => handleInput('email', e.target.value)}
                  disabled={loading}
                />
              </div>
            </motion.div>

            {/* Role Selection */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                I am a <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={val => handleInput('role', val)}
                disabled={loading}
              >
                <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-200 bg-gray-50/50 hover:bg-white hover:border-teal-300">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2">
                  <SelectItem value="recipient" className="rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">🤝</span>
                      <span>Food Recipient</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="donor" className="rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">🍎</span>
                      <span>Food Donor</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="volunteer" className="rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">💪</span>
                      <span>Volunteer</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin" className="rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">⚙️</span>
                      <span>Admin</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border-l-4 border-teal-400">
                {roleIcons[formData.role]} {roleDesc[formData.role]}
              </p>
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors duration-200" size={20} />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  className="pl-12 pr-12 h-12 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-200 bg-gray-50/50 hover:bg-white hover:border-teal-300"
                  value={formData.password}
                  onChange={e => handleInput('password', e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-500 transition-colors duration-200 p-1"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Password Strength:</span>
                    <span className={`font-medium ${strength >= 4 ? 'text-green-600' : strength >= 3 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {getPasswordStrengthText(strength)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(strength)}`}
                      style={{ width: `${(strength / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Confirm Password */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors duration-200" size={20} />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  className="pl-12 pr-12 h-12 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-200 bg-gray-50/50 hover:bg-white hover:border-teal-300"
                  value={formData.confirmPassword}
                  onChange={e => handleInput('confirmPassword', e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-500 transition-colors duration-200 p-1"
                  disabled={loading}
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formData.confirmPassword && (
                <div className="mt-2 flex items-center space-x-2">
                  {formData.password === formData.confirmPassword ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle2 size={16} />
                      <span className="text-sm font-medium">Passwords match</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-red-500">
                      <span className="text-sm font-medium">Passwords don't match</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Optional Fields - Phone */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </Label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors duration-200" size={20} />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+27 123 456 789"
                  className="pl-12 h-12 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-200 bg-gray-50/50 hover:bg-white hover:border-teal-300"
                  value={formData.phone}
                  onChange={e => handleInput('phone', e.target.value)}
                  disabled={loading}
                />
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </motion.div>
          </form>

          {/* Sign In Link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="mt-8 text-center text-gray-600"
          >
            Already have an account?{' '}
            <button 
              onClick={onToggleMode} 
              className="text-teal-600 hover:text-teal-700 font-semibold hover:underline transition-colors duration-200"
            >
              Sign In
            </button>
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  )} 