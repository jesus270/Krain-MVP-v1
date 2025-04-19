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
import { TagChip } from "@/components/tag-chip";
import { MessagesSquareIcon } from "lucide-react";

const faqs = [
  {
    id: "Q1",
    question: "What is the Founders Key?",
    answer:
      "The Krain Founders Key is a digital key offered during a special campaign, providing holders with exclusive benefits like $KRAIN token allocation, boosted staking rewards, increased airdrop points, and lifetime Krain app advantages.",
  },
  {
    id: "Q2",
    question: "What benefits do I get from owning a Founders Key?",
    answer:
      "Owning a Founders Key grants you: 3x token allocation ($300 worth of $KRAIN at TGE price), boosted staking rewards (25% APY), 2x airdrop point distribution, and lifetime Krain app benefits.",
  },
  {
    id: "Q3",
    question: "How much does the Founders Key cost?",
    answer:
      "The Founders Keys will be sold in batches of 1,000, starting at $100 each (payable in ETH).",
  },
  {
    id: "Q4",
    question: "Is the Founders Key tradeable?",
    answer: "Yes, the Founders Keys are tradeable.",
  },
  {
    id: "Q5",
    question: "When will the mint go live?",
    answer: "The Founders Key sale date is May 6th.",
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
        <div className="hidden md:block group-data-[state=closed]:hidden group-data-[state=open]:block text-[#8781BB] text-sm max-w-[50%] mx-auto text-left pl-12">
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

export function FoundersKeyFaqSection() {
  return (
    <section
      id="faq"
      className="relative flex flex-col w-full bg-[#04030C] py-12 md:py-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="flex flex-col w-full">
        <TagChip
          icon={<MessagesSquareIcon className="w-4 h-4 text-[#6237EF]" />}
          text="Q&A"
          className="mb-6 self-start"
        />
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            FAQs
          </h2>
          <p className="text-sm sm:text-base text-gray-300">
            If you can't find an answer that you're looking for, contact us via
            DM on X or click the support bubble in the bottom right corner of
            our websites.
          </p>
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
                  <span className="text-base">{faq.question}</span>
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
