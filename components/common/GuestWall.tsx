// © 2026 DoctoPal — All Rights Reserved
"use client";

import Link from "next/link";
import { Lock, UserPlus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface Props {
  reason: "personal" | "limit";
}

export function GuestWall({ reason }: Props) {
  const { lang } = useLang();

  return (
    <Card className="mx-auto max-w-md border-primary/20">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>
          {tx(reason === "personal" ? "guest.personalTitle" : "guest.limitTitle", lang)}
        </CardTitle>
        <CardDescription>
          {tx(reason === "personal" ? "guest.personalDesc" : "guest.limitDesc", lang)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Link href="/auth/login">
          <Button className="w-full gap-2 bg-primary hover:bg-primary/90">
            <UserPlus className="h-4 w-4" />
            {tx("guest.signUpFree", lang)}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <p className="text-center text-xs text-muted-foreground">
          {tx("guest.alreadyHave", lang)}{" "}
          <Link href="/auth/login" className="text-primary underline">{tx("guest.signInLink", lang)}</Link>
        </p>
      </CardContent>
    </Card>
  );
}
