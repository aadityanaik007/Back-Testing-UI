"use client";
import { useState } from "react";
import Link from "next/link";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
             Back to Home
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Join the Indian Options Backtesting platform
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <p className="text-center text-gray-600">Signup form coming soon...</p>
        </div>
      </div>
    </div>
  );
}
