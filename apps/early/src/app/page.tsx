"use client";

import { Button } from "@krain/ui/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@krain/ui/components/ui/card";
export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl sm:text-5xl">
            <h1>Early Access Signup</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl sm:text-2xl max-w-2xl">
            Get early access to KRAiN's revolutionary AI Agent Marketplace & AI
            Agent Builder.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button size="lg">Sign Up</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
