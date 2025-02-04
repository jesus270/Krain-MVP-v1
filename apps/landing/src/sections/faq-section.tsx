"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@krain/ui/components/ui/accordion";
import { cn } from "@krain/ui/lib/utils";
import Image from "next/image";
import React from "react";
import Link from "next/link";

const faqs = [
  {
    id: "QA_1",
    question: "What is KRAIN AI?",
    answer:
      "The AI agent ecosystem is fragmented, difficult to navigate, and largely inaccessible to those outside of the developer community. Krain AI is building the intelligent infrastructure that enables seamless discovery, trust, and interoperability in the AI agent space. With Krain AI, innovators and businesses can explore, connect, and create AI agents faster than ever—fueling the next wave of AI-driven automation.",
  },
  {
    id: "QA_2",
    question: "How does KRAIN utilizes AI?",
    answer:
      "KRAIN leverages advanced AI algorithms to provide intelligent agent discovery, performance metrics analysis, and automated recommendations, enhancing the overall ecosystem efficiency and user experience.",
  },
  {
    id: "QA_3",
    question: "How do I use KRAIN?",
    answer:
      "You can start using KRAIN by connecting your wallet, exploring the AI agent marketplace, and utilizing our discovery tools to find the perfect agents for your needs.",
  },
  {
    id: "QA_4",
    question: "Is there any cost to using KRAIN?",
    answer:
      "Basic features are available for free. Premium features require holding $KRAIN tokens or paying a subscription fee.",
  },
  {
    id: "QA_5",
    question: "What is $KRAIN utility token?",
    answer:
      "The $KRAIN token is the native utility token of the platform, used for governance, staking rewards, and accessing premium features.",
  },
  {
    id: "QA_6",
    question: "Where can I learn more about KRAIN?",
    answer: (
      <>
        You can learn more about Krain by using our systems, reading out white
        paper, and participating in our community. Join our{" "}
        <Link
          className="font-bold text-blue-500 hover:text-blue-400 underline"
          href={"https://t.me/krainofficial"}
          target="_blank"
        >
          Telegram
        </Link>{" "}
        for the latest updates.
      </>
    ),
  },
];

const CustomAccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionTrigger>,
  React.ComponentPropsWithoutRef<typeof AccordionTrigger> & {
    answer: string | React.ReactNode;
    questionId: string;
  }
>(({ className, children, answer, questionId, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "relative flex items-center w-full py-4 text-sm font-medium transition-all text-white hover:text-white hover:no-underline group",
        className,
      )}
      {...props}
    >
      <span className="absolute left-0 text-left z-10 text-xl md:text-2xl md:max-w-[30%] flex flex-col">
        <span className="text-[#0B4A50] text-sm">{questionId}</span>
        {children}
      </span>
      <div className="w-full justify-center hidden md:flex">
        <div className="group-data-[state=closed]:block group-data-[state=open]:hidden w-[149px]">
          <Image
            src="/separator-horizontal.svg"
            alt="Separator"
            width={149}
            height={2}
            className="w-full hidden md:block"
          />
        </div>
        <div className="hidden md:block group-data-[state=closed]:hidden group-data-[state=open]:block text-[#8781BB] text-sm max-w-[40%] mx-auto">
          {answer}
        </div>
      </div>
      <div className="absolute right-0 h-10 w-10 z-10 flex items-center justify-center">
        <Image
          src="/icon-plus.svg"
          alt="Expand"
          width={40}
          height={40}
          className="absolute transition-opacity duration-300 group-data-[state=closed]:opacity-100 group-data-[state=open]:opacity-0"
        />
        <Image
          src="/icon-minus.svg"
          alt="Collapse"
          width={40}
          height={40}
          className="absolute transition-opacity duration-300 group-data-[state=closed]:opacity-0 group-data-[state=open]:opacity-100"
        />
      </div>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
CustomAccordionTrigger.displayName = "CustomAccordionTrigger";

export function FaqSection() {
  return (
    <section id="faq" className="relative flex flex-col w-full bg-[#04030C]">
      <div className="flex flex-col w-full">
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            FAQs
          </h2>
        </div>
        <Accordion type="single" collapsible className="space-y-0 w-full">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className={`py-10 border-t border-x-0 ${
                index === faqs.length - 1 ? "border-b" : ""
              }`}
              style={{
                borderImageSource:
                  "linear-gradient(90deg, #171528 0%, #3F396A 41%, #7B70D0 48%, #3F396A 66%, #171528 100%)",
                borderImageSlice: "1",
              }}
            >
              <div className="flex flex-col">
                <CustomAccordionTrigger answer={faq.answer} questionId={faq.id}>
                  {faq.question}
                </CustomAccordionTrigger>
                <AccordionContent className="pt-4 pb-0 md:hidden">
                  <span className="text-[#8781BB] text-sm">{faq.answer}</span>
                </AccordionContent>
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
