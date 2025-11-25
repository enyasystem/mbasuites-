import { useEffect } from "react";
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

type FormValues = {
  email: string;
  password: string;
  remember: boolean;
};

export default function StaffLogin() {
  const navigate = useNavigate();
  const { register, handleSubmit, setValue } = useForm<FormValues>({
    defaultValues: { email: "", password: "", remember: false },
  });

  useEffect(() => {
    // load remembered email
    try {
      const saved = window.localStorage.getItem("staff_email");
      if (saved) setValue("email", saved);
    } catch (e) {}
  }, [setValue]);

  const onSubmit = (data: FormValues) => {
    // simple placeholder auth: replace with real auth flow
    const { email, password, remember } = data;
    if (remember) {
      try {
        window.localStorage.setItem("staff_email", email);
      } catch (e) {}
    } else {
      try {
        window.localStorage.removeItem("staff_email");
      } catch (e) {}
    }

    // fake auth
    if (email === "staff@example.com" && password === "password") {
      toast({ title: "Signed in", description: "Welcome back!" });
      navigate("/my-bookings");
    } else {
      toast({ title: "Invalid credentials", description: "Check email and password", variant: "destructive" });
    }
  };

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
                <Input id="email" {...register("email", { required: true })} />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register("password", { required: true })} />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="remember" {...register("remember")} />
                <Label htmlFor="remember">Remember me</Label>
              </div>

              <Button type="submit" className="w-full">Sign in</Button>
            </form>

            <div className="text-sm text-muted-foreground mt-3">
              Use <strong>staff@example.com</strong> / <strong>password</strong> to sign in (demo).
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
