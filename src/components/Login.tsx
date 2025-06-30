import React from "react";
import { LoginForm } from "./login-form";
import Image from "next/image";

export default function Login() {
  return (
    <div>
      {" "}
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm flex flex-col items-center mb-6">
          <Image
            src="/icons/icon-192x192.png"
            alt="Agnel Polytechnic Logo"
            width={96}
            height={96}
            className="mb-2"
          />
          <h1 className="text-2xl font-bold mb-4 text-center">
            Agnel Polytechnic
          </h1>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
