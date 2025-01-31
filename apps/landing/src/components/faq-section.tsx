"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@krain/ui/components/ui/accordion";

const faqs = [
  {
    question: "What is KRAIN AI?",
    answer:
      "The Krain ecosystem is powered by the $Krain token, built to enhance the ecosystem experience by providing access to premium app features, generous staking rewards, community governance voting and more.",
  },
  {
    question: "How does KRAIN utilizes AI?",
    answer:
      "KRAIN leverages advanced AI algorithms to provide intelligent agent discovery, performance metrics analysis, and automated recommendations, enhancing the overall ecosystem efficiency and user experience.",
  },
  {
    question: "How do I use KRAIN?",
    answer:
      "You can start using KRAIN by connecting your wallet, exploring the AI agent marketplace, and utilizing our discovery tools to find the perfect agents for your needs.",
  },
  {
    question: "Is there any cost to using KRAIN?",
    answer:
      "Basic features are available for free. Premium features require holding $KRAIN tokens or paying a subscription fee.",
  },
  {
    question: "What is $KRAIN utility token?",
    answer:
      "The $KRAIN token is the native utility token of the platform, used for governance, staking rewards, and accessing premium features.",
  },
  {
    question: "Where can I learn more about KRAIN?",
    answer:
      "You can learn more about KRAIN through our whitepaper, documentation, and community channels. Join our Discord or Telegram for the latest updates.",
  },
];

export function FaqSection() {
  return (
    <Accordion type="single" collapsible className="space-y-4">
      {faqs.map((faq, index) => (
        <AccordionItem
          key={index}
          value={`item-${index}`}
          className="border border-gray-800 rounded-lg bg-gray-900/50 backdrop-blur px-6"
        >
          <AccordionTrigger className="text-white hover:text-white text-left">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-gray-400">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
