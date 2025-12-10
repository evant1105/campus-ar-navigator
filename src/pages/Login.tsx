import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Login: React.FC = () => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, loginAsGuest } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await login(studentId, password);
    
    if (success) {
      toast({
        title: "Welcome back!",
        description: "Successfully signed in to MyCampus AR Wayfinder",
      });
      navigate('/home');
    } else {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    toast({
      title: "Welcome, Guest!",
      description: "You're now browsing as a guest",
    });
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      {/* Header Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-8">
        {/* Logo */}
        <div className="w-20 h-20 rounded-2xl bg-card flex items-center justify-center mb-6 shadow-lg">
          <Compass className="w-10 h-10 text-primary" />
        </div>
        
        {/* Title */}
        <h1 className="text-xl font-bold text-primary-foreground mb-1">
          MyCampus AR Wayfinder
        </h1>
        <p className="text-primary-foreground/80 text-sm">
          Navigate your campus with confidence
        </p>
      </div>

      {/* Login Form Card */}
      <div className="bg-card rounded-t-3xl px-6 py-8 shadow-2xl">
        <div className="max-w-sm mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">
            Welcome Back!
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            Sign in to continue
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="studentId" className="text-sm font-medium">
                Student ID
              </Label>
              <Input
                id="studentId"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Enter your student ID"
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="h-12"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                Remember me
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              variant="hero"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            <Button
              type="button"
              variant="hero-outline"
              className="w-full"
              onClick={handleGuestLogin}
            >
              Guest Login
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Help Center</a>
              <span>•</span>
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4">
              © 2025 Lengzai. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
