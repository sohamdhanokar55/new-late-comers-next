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
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [dept, setDept] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async function () {
    if (!dept || !password) {
      toast({
        title: "Please Enter email and password",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      await login(dept, password);
      console.log("Logging in");
      router.push("/");
    } catch (e) {
      toast({
        title: "There was an error logging you in",
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
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your username and password to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Username</Label>
              <Input
                value={dept}
                onChange={(e) => {
                  setDept(e.target.value);
                }}
                type="email"
                placeholder="APV1@GMAIL.COM"
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
              {submitting ? "Submitting" : "Submit"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="text-center mt-4">
        <span>Don't have an account? </span>
        <a
          href="/signup"
          className="text-primary underline hover:text-primary/80"
        >
          Sign Up
        </a>
      </div>
    </div>
  );
}
