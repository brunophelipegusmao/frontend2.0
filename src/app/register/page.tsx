"use client";

import { Suspense } from "react";
import { RegisterForm } from "@/app/users/register/RegisterForm";

export default function RegisterEntryPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
