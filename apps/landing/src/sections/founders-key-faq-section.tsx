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
    question: "What is the KRAIN Founders Key?",
    answer:
      "The KRAIN Founders Key is a limited edition NFT on the Base blockchain that unlocks exclusive utility, benefits, and rewards across the KRAIN ecosystem. Also, it serves as your VIP key to unlock future benefits.",
  },
  {
    id: "Q2",
    question: "How many Founders Keys are available?",
    answer:
      "Only 777 Keys will be sold, making this a rare asset in the KRAIN ecosystem.",
  },
  {
    id: "Q3",
    question: "How much does a Founders Key cost?",
    answer:
      "Whitelist Sale: $150 each - Public Sale: $200 each, or $150 each when buying 5 or more",
  },
  {
    id: "Q4",
    question: "What do I get with a Founders Key?",
    answer:
      "Every Key includes: ∙ $450 worth of $KRAIN tokens at the TGE price (56,250 tokens) ∙ 25% APY staking rewards, starting immediately ∙ 2x airdrop multiplier and access to a 15% reserved airdrop pool ∙ Whitelabel AI Hosting License (valued at $1200/year) ∙ A tradable NFT asset on OpenSea and ArenaVS (Base) ∙ A Founders Key Holder role in the KRAIN Ecosystem ∙ Access to future benefits and drops",
  },
  {
    id: "Q5",
    question: "How do the $KRAIN token benefits work?",
    answer:
      "Tokens will be distributed after a 1 month cliff from the TGE date over a 12 month period of time. You will be able to claim these tokens each month as they unlock.",
  },
  {
    id: "Q6",
    question: "How does the staking reward work?",
    answer:
      "Founders Key holders get 25% APY on their $KRAIN tokens, starting from the day of the sale.",
  },
  {
    id: "Q7",
    question: "What's the benefit of the 2x airdrop and 15% pool?",
    answer:
      "Key holders receive double the airdrop points they earn and share of a dedicated 15% of the total airdrop pool, reserved only for Founders Key owners. That means significantly higher $KRAIN allocations.",
  },
  {
    id: "Q8",
    question: "What is the Whitelabel Hosting License?",
    answer:
      "Each Key includes a license to run your own AI app hosting company using KRAIN's infrastructure — normally priced at $1200 per year. This gives you the ability to build your own business with recurring revenue.",
  },
  {
    id: "Q9",
    question: "Is the Founders Key an NFT? Can I trade it?",
    answer:
      "Yes, the Key is a fully tradeable digital asset on the Base blockchain (on OpenSea and ArenaVS), and it can be sold or transferred freely after the sale concludes.",
  },
  {
    id: "Q10",
    question: "When does the sale take place?",
    answer:
      "Whitelist Sale: May 6th at 2PM UTC, Public Sale: May 6th at 6PM UTC",
  },
  {
    id: "Q11",
    question: "Will there be future benefits for Founders Key holders?",
    answer:
      "Yes, we plan to add additional benefits for Founders Key holders in the future.",
  },
  {
    id: "Q12",
    question: "Where can I mint the Founders Key?",
    answer:
      "Minting will be available on the Arena VS Marketplace. Ensure you are on the correct site and watch for official announcements.",
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
            DM{" "}
            <Link
              href="https://x.com/krain_ai"
              target="_blank"
              rel="noopener noreferrer"
            >
              @krain_ai
            </Link>{" "}
            on X or click the support bubble in the bottom right corner of the
            <Link
              href="https://whitelist.krain.ai"
              target="_blank"
              rel="noopener noreferrer"
            >
              whitelist
            </Link>{" "}
            signup page.
            <br />
            <br />
            Note: TGE is planned for 3rd Quarter 2025 and we're actively in
            conversations with leading Tier 1 exchanges.
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
