"use client";

import { Suspense } from "react";
import LoginForm from "./LoginForm";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
          <Card className="w-full max-w-md">
            <CardContent className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
