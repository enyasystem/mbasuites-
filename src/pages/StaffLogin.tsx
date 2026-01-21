import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { Loader2 } from "lucide-react";

type FormValues = {
  email: string;
  password: string;
  remember: boolean;
};

export default function StaffLogin() {
  const navigate = useNavigate();
  const { signIn, user, loading: authLoading } = useAuth();
  const { isAdmin, isStaff, isLoading: roleLoading } = useRoleCheck();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue } = useForm<FormValues>({
    defaultValues: { email: "", password: "", remember: false },
  });

  useEffect(() => {
    // load remembered email
    try {
      const saved = window.localStorage.getItem("staff_email");
      if (saved) setValue("email", saved);
    } catch (e) {
      // localStorage may be unavailable in some environments — warn and continue
      // eslint-disable-next-line no-console
      console.warn("Failed to read staff_email from localStorage", e);
    }
  }, [setValue]);

  // Redirect authenticated staff/admins
  useEffect(() => {
    if (!authLoading && !roleLoading && user) {
      if (isAdmin) {
        navigate("/admin");
      } else if (isStaff) {
        navigate("/staff");
      }
    }
  }, [user, authLoading, roleLoading, isAdmin, isStaff, navigate]);

  const onSubmit = async (data: FormValues) => {
    const { email, password, remember } = data;
    
    if (remember) {
      try {
        window.localStorage.setItem("staff_email", email);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("Failed to save staff_email to localStorage", e);
      }
    } else {
      try {
        window.localStorage.removeItem("staff_email");
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("Failed to remove staff_email from localStorage", e);
      }
    }

    setIsSubmitting(true);
    try {
      await signIn(email, password);
      // Redirect will happen via useEffect after role is fetched
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : typeof err === 'string' ? err : JSON.stringify(err);
      toast({
        title: "Login failed",
        description: msg || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="p-6">
            <h1 className="text-2xl font-bold mb-4">Staff Login</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email", { required: true })} />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register("password", { required: true })} />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="remember" {...register("remember")} />
                <Label htmlFor="remember">Remember me</Label>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
