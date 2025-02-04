import { XLogo } from "@krain/ui/components/icons/XLogo";
import { MediumLogo } from "@krain/ui/components/icons/logo-medium";
import { CoinMarketCapLogo } from "@krain/ui/components/icons/logo-coinmarketcap";
import { TelegramLogo } from "@krain/ui/components/icons/logo-telegram";
import { MailIcon } from "lucide-react";
import { cn } from "@krain/ui/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@krain/ui/components/ui/tooltip";

export function SocialNav({ className }: { className?: string }) {
  return (
    <TooltipProvider>
      <div
        className={cn(
          "hidden md:flex md:flex-col md:absolute md:right-8 md:top-1/2 md:-translate-y-1/2 gap-4 z-50",
          className,
        )}
      >
        <a
          href="https://t.me/krainofficial"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "p-3 rounded-full text-gray-400 hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center",
            className?.includes("nav-social") && "text-white hover:text-white",
          )}
        >
          <TelegramLogo className="w-5 h-5" />
        </a>
        <a
          href="https://twitter.com/krain_ai"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "p-3 rounded-full text-gray-400 hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center",
            className?.includes("nav-social") && "text-white hover:text-white",
          )}
        >
          <XLogo className="w-5 h-5" />
        </a>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "p-3 rounded-full text-gray-400 transition-all duration-200 cursor-not-allowed flex items-center justify-center opacity-50",
                className?.includes("nav-social") && "text-white",
              )}
            >
              <MediumLogo className="w-5 h-5" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Coming Soon</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "p-3 rounded-full text-gray-400 transition-all duration-200 cursor-not-allowed flex items-center justify-center opacity-50",
                className?.includes("nav-social") && "text-white",
              )}
            >
              <CoinMarketCapLogo className="w-5 h-5" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Coming Soon</p>
          </TooltipContent>
        </Tooltip>
        <a
          href="mailto:contact@krain.ai"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "p-3 rounded-full text-gray-400 hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center",
            className?.includes("nav-social") && "text-white hover:text-white",
          )}
        >
          <MailIcon className="w-5 h-5" />
        </a>
      </div>
    </TooltipProvider>
  );
}
