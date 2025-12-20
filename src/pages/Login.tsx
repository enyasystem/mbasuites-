import { useState } from "react";
import { useNavigate, Link, useLocation as useRouterLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedInput } from "@/components/ui/animated-input";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, signInWithFacebook } = useAuth();
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const routerLocation = useRouterLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, dirtyFields },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    
    try {
      await signIn(data.email, data.password);
      const returnTo = (routerLocation.state as any)?.returnTo;
      const formValues = (routerLocation.state as any)?.formValues;
      const bookingData = (routerLocation.state as any)?.bookingData;
      if (returnTo) {
        navigate(returnTo, { state: { formValues, bookingData } });
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSocialLoading(true);
    try {
      await signInWithGoogle();
      const returnTo = (routerLocation.state as any)?.returnTo;
      const formValues = (routerLocation.state as any)?.formValues;
      const bookingData = (routerLocation.state as any)?.bookingData;
      if (returnTo) {
        navigate(returnTo, { state: { formValues, bookingData } });
        return;
      }
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setSocialLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setSocialLoading(true);
    try {
      await signInWithFacebook();
      const returnTo = (routerLocation.state as any)?.returnTo;
      const formValues = (routerLocation.state as any)?.formValues;
      const bookingData = (routerLocation.state as any)?.bookingData;
      if (returnTo) {
        navigate(returnTo, { state: { formValues, bookingData } });
        return;
      }
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>Sign in to your account to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <AnimatedInput
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  error={errors.email?.message}
                  success={dirtyFields.email && !errors.email}
                  {...register("email")}
                />

                <AnimatedInput
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  success={dirtyFields.password && !errors.password}
                  {...register("password")}
                />

                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-sm text-accent hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  disabled={loading || socialLoading || !isValid}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>

                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                    OR CONTINUE WITH
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    disabled={loading || socialLoading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFacebookSignIn}
                    disabled={loading || socialLoading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                      />
                    </svg>
                    Facebook
                  </Button>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-accent hover:underline">
                    Sign up
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
