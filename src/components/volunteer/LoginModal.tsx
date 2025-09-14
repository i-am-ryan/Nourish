import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Mail, 
  Lock, 
  ArrowLeft, 
  HandHeart, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Shield, 
  Heart,
  CheckCircle 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoginModalProps {
  onLogin: (email: string, password: string) => void;
  onBack: () => void;
}

const LoginModal = ({ onLogin, onBack }: LoginModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await onLogin(email, password);
      toast({
        title: isSignUp ? "Account Created!" : "Welcome Back!",
        description: isSignUp 
          ? "Your volunteer journey begins now" 
          : "Ready to make an impact today?",
      });
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: "Please check your credentials and try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50/50 via-teal-50/50 to-cyan-50/50 dark:from-gray-900 dark:via-emerald-900/5 dark:to-gray-900">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Welcome
          </Button>

          {/* Enhanced Card with Glass Effect */}
          <div className="relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/30">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full"></div>
            </div>

            <CardHeader className="text-center relative pb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl mb-6 mx-auto shadow-xl relative"
              >
                <HandHeart className="w-10 h-10 text-white" />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </motion.div>
              
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                {isSignUp ? "Join Our Impact Community" : "Welcome Back, Hero!"}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 text-lg mt-3">
                {isSignUp 
                  ? "Create your free account to start making a difference" 
                  : "Sign in to continue your volunteer journey"}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="relative">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-300" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-12 bg-white/50 dark:bg-gray-900/50 backdrop-blur border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                      placeholder="volunteer@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-300" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-12 h-12 bg-white/50 dark:bg-gray-900/50 backdrop-blur border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-emerald-500 transition-colors duration-300"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 group relative overflow-hidden"
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Please wait...</span>
                    </div>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <HandHeart className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                      {isSignUp ? 'Start My Impact Journey' : 'Continue My Mission'}
                      <Sparkles className="w-4 h-4 ml-2 group-hover:scale-125 transition-transform duration-300" />
                    </>
                  )}
                </Button>

                {/* Toggle Sign Up/Sign In */}
                <div className="text-center pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium transition-colors duration-300 group"
                  >
                    {isSignUp ? (
                      <span className="flex items-center justify-center space-x-2">
                        <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                        <span>Already have an account? Sign in</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center space-x-2">
                        <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                        <span>New to NourishSA? Create account</span>
                      </span>
                    )}
                  </button>
                </div>
              </form>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50"
              >
                <div className="flex justify-center items-center space-x-6 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>Secure & Private</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-emerald-600" />
                    <span>100% Non-Profit</span>
                  </div>
                </div>
                <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
                  Join 25,000+ volunteers making a difference across South Africa
                </p>
              </motion.div>
            </CardContent>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginModal;