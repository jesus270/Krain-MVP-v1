import { XLogo } from "@krain/ui/components/icons/XLogo";
import { MediumLogo } from "@krain/ui/components/icons/logo-medium";
import { CoinMarketCapLogo } from "@krain/ui/components/icons/logo-coinmarketcap";
import { TelegramLogo } from "@krain/ui/components/icons/logo-telegram";

export function SocialNav() {
  return (
    <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
      <a
        href="https://t.me/krain_ai"
        target="_blank"
        rel="noopener noreferrer"
        className="p-3 rounded-full text-gray-400 hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center"
      >
        <TelegramLogo className="w-5 h-5" />
      </a>
      <a
        href="https://twitter.com/krain_ai"
        target="_blank"
        rel="noopener noreferrer"
        className="p-3 rounded-full text-gray-400 hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center"
      >
        <XLogo className="w-5 h-5" />
      </a>
      <a
        href="https://medium.com/krain_ai"
        target="_blank"
        rel="noopener noreferrer"
        className="p-3 rounded-full text-gray-400 hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center"
      >
        <MediumLogo className="w-5 h-5" />
      </a>
      <a
        href="https://coinmarketcap.com/currencies/krain/"
        target="_blank"
        rel="noopener noreferrer"
        className="p-3 rounded-full text-gray-400 hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center"
      >
        <CoinMarketCapLogo className="w-5 h-5" />
      </a>
    </div>
  );
}
