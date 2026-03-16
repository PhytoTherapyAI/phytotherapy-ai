"use client";

import Link from "next/link";
import { Lock, UserPlus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  /** "personal" = user asked personal question without account, "limit" = guest query limit reached */
  reason: "personal" | "limit";
}

export function GuestWall({ reason }: Props) {
  return (
    <Card className="mx-auto max-w-md border-primary/20">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>
          {reason === "personal"
            ? "Account Required for Personal Recommendations"
            : "Free Queries Used Up"}
        </CardTitle>
        <CardDescription>
          {reason === "personal"
            ? "To give you safe, personalized recommendations, we need your medication profile. Sign up — it takes less than 2 minutes."
            : "You've used your 2 free queries. Sign up for unlimited access to evidence-based recommendations."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Link href="/auth/login">
          <Button className="w-full gap-2 bg-primary hover:bg-primary/90">
            <UserPlus className="h-4 w-4" />
            Sign Up Free
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
