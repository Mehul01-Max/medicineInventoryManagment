import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Pill, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const passwordRules = [
  { label: 'At least 6 characters', test: (pw: string) => pw.length >= 6 },
  { label: 'Contains a number', test: (pw: string) => /\d/.test(pw) },
  { label: 'Contains a letter', test: (pw: string) => /[a-zA-Z]/.test(pw) },
];

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const allRulesPass = passwordRules.every(r => r.test(password));
  const passwordsMatch = password === confirmPw && confirmPw.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!allRulesPass) {
      setError('Password does not meet the requirements.');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await signup(email, name, password);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success('Account created! Welcome aboard 🎉');
    navigate('/welcome', { replace: true });
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col overflow-hidden relative">
      {/* Decorative gradient orbs */}
      <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-72 h-72 rounded-full bg-primary/8 blur-3xl pointer-events-none" />

      <main className="flex-1 mx-auto max-w-md w-full px-6 py-8 flex flex-col relative z-10">
        <div className="flex-1 flex flex-col justify-center">
          {/* Logo / Brand */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="h-16 w-16 rounded-2xl bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-elevated mx-auto mb-5">
              <Pill className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Join StockSmart and never run out of medicine
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/60 shadow-elevated p-6 animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl bg-destructive/10 text-destructive text-sm px-4 py-3 font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-sm font-medium">
                  Full name
                </Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Mehul Agarwal"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className="h-12 rounded-xl bg-background/60 border-border/80 focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-sm font-medium">
                  Email address
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-12 rounded-xl bg-background/60 border-border/80 focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="h-12 rounded-xl bg-background/60 border-border/80 focus:border-primary pr-12 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password strength indicators */}
                {password.length > 0 && (
                  <ul className="space-y-1 mt-2">
                    {passwordRules.map(rule => {
                      const passes = rule.test(password);
                      return (
                        <li
                          key={rule.label}
                          className={`flex items-center gap-2 text-xs transition-colors ${
                            passes ? 'text-success' : 'text-muted-foreground'
                          }`}
                        >
                          {passes ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <X className="h-3.5 w-3.5" />
                          )}
                          {rule.label}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password" className="text-sm font-medium">
                  Confirm password
                </Label>
                <Input
                  id="signup-confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  required
                  autoComplete="new-password"
                  className={`h-12 rounded-xl bg-background/60 border-border/80 focus:border-primary transition-colors ${
                    confirmPw.length > 0 && !passwordsMatch ? 'border-destructive focus:border-destructive' : ''
                  }`}
                />
                {confirmPw.length > 0 && !passwordsMatch && (
                  <p className="text-xs text-destructive flex items-center gap-1.5 mt-1">
                    <X className="h-3.5 w-3.5" />
                    Passwords do not match
                  </p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-primary shadow-elevated hover:shadow-floating hover:brightness-110 transition-all duration-200 mt-2"
                disabled={loading || !allRulesPass || !passwordsMatch}
              >
                {loading ? (
                  <div className="h-5 w-5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" />
                    Create account
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Footer link */}
          <p className="text-center text-sm text-muted-foreground mt-6 animate-fade-in">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary hover:text-primary/80 transition-colors underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Signup;
