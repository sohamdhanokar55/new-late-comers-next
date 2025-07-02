"use client";
import { usePathname } from "next/navigation";
import React from "react";
import { Button } from "./ui/button";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const { logOut, currentUser } = useAuth();
  const pathname = usePathname();

  // Only show header on main pages
  if (
    pathname === "/" ||
    pathname === "/late-comers" ||
    pathname === "/reports"
  ) {
    return (
      <div>
        <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 p-4">
          <div className="container mx-auto flex justify-between items-center py-2">
            <div className="flex items-center gap-3">
              <img
                src="/icons/icon-192x192.png"
                alt="Logo"
                className="h-12 w-12"
              />
              <h1 className="text-lg font-semibold">Late Comers System</h1>
            </div>
            {currentUser && <Button onClick={logOut}>Logout</Button>}
          </div>
        </header>
      </div>
    );
  } else {
    return null;
  }
}
