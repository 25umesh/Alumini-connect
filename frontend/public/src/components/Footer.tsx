// src/components/Footer.tsx
import React from "react";

export default function Footer() {
  return (
    <footer className="bg-white border-t py-4 mt-8">
      <div className="container mx-auto text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Alumni-Connect
      </div>
    </footer>
  );
}
