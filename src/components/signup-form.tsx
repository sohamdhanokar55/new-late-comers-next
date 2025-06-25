"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async function () {
    if (!email || !password) {
      toast({
        title: "Please enter email and password",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      await signUp(email, password);
      toast({
        title: "Account created successfully!",
        variant: "default",
      });
      router.push("/");
    } catch (e) {
      toast({
        title: "There was an error creating your account",
        variant: "destructive",
      });
      console.log(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your email and password to create a new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                type="email"
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                required
              />
            </div>
            <Button type="submit" className="w-full" onClick={handleSubmit}>
              {submitting ? "Submitting" : "Sign Up"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="text-center mt-4">
        <span>Already have an account? </span>
        <a href="/" className="text-primary underline hover:text-primary/80">
          Login
        </a>
      </div>
    </div>
  );
}
