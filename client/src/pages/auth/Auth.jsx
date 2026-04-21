import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { motion } from 'framer-motion';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'candidate' });
  const [errorMsg, setErrorMsg] = useState('');
  
  const { login, register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      let data;
      if (isLogin) {
        data = await login(formData.email, formData.password);
      } else {
        data = await register(formData.name, formData.email, formData.password, formData.role);
      }
      
      if (data?.role === 'employer' || data?.role === 'admin') {
        navigate('/employer');
      } else {
        navigate('/candidate');
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-muted/20 px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="border shadow-lg">
          <CardHeader className="space-y-2 text-center pb-8">
            <CardTitle className="text-3xl font-heading tracking-tight">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </CardTitle>
            <CardDescription className="text-base">
              {isLogin ? 'Enter your details to sign in to your account' : 'Enter your details below to create your account'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {errorMsg && (
                <div className="p-3 text-sm text-destructive-foreground bg-destructive/90 rounded-md">
                  {errorMsg}
                </div>
              )}
              
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="name">Name</label>
                    <Input 
                      id="name" 
                      placeholder="John Doe" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="role">I am a</label>
                    <select 
                      id="role"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="candidate">Candidate</option>
                      <option value="employer">Employer</option>
                    </select>
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="email">Email</label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="password">Password</label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-4">
              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>
              <div className="text-center text-sm text-muted-foreground w-full">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  type="button" 
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-medium underline underline-offset-4 hover:text-primary transition-colors"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
