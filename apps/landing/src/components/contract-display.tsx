import { Copy } from "lucide-react";
import Image from "next/image";
import { Button } from "@krain/ui/components/ui/button";

interface ContractDisplayProps {
  address: string;
}

const formatAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export function ContractDisplay({ address }: ContractDisplayProps) {
  return (
    <div className="flex justify-center">
      <div className="relative inline-block">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            padding: "1px",
            background: "linear-gradient(120deg, #1FC5D64D 30%, #1FC5D64D 0%)",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
          }}
        />
        <div className="relative flex items-center gap-2 sm:gap-4 rounded-full [background:linear-gradient(120deg,#2A274E4D_30%,#0909114D_100%)] backdrop-blur px-3 sm:px-6 py-2 sm:py-3">
          <div className="flex flex-col items-start gap-1 sm:gap-2 justify-start">
            <span className="text-xs sm:text-sm text-[#8781BB]">
              Audited by:
            </span>
            <Image
              src="/logo-hacken.svg"
              alt="Hacken"
              width={99}
              height={22}
              className="object-contain w-[80px] sm:w-auto"
            />
          </div>
          <Image
            src="/separator.svg"
            alt="Separator"
            width={3}
            height={72}
            className="object-contain h-[50px] sm:h-[72px]"
          />
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            <Image
              src="/icon-square-krain-token.png"
              alt="Krain Token"
              width={54}
              height={54}
              className="object-contain rounded-full w-[40px] h-[40px] sm:w-[54px] sm:h-[54px]"
            />
            <div className="flex flex-col items-start justify-start gap-1 sm:gap-2">
              <span className="text-xs sm:text-sm text-[#8781BB]">
                Contract address:
              </span>
              <code className="text-xs sm:text-sm text-white blur-sm">
                <span className="sm:hidden">{formatAddress(address)}</span>
                <span className="hidden sm:inline">{address}</span>
              </code>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white p-1 sm:p-2"
              disabled
            >
              <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
