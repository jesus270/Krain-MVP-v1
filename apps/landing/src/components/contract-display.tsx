import { Copy } from "lucide-react";
import Image from "next/image";
import { Button } from "@krain/ui/components/ui/button";

interface ContractDisplayProps {
  address: string;
}

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
        <div className="relative flex items-center gap-4 rounded-full [background:linear-gradient(120deg,#2A274E4D_30%,#0909114D_100%)] backdrop-blur px-6 py-3">
          <div className="flex flex-col items-start gap-2 justify-start">
            <span className="text-sm text-[#8781BB]">Audited by:</span>
            <Image
              src="/logo-hacken.svg"
              alt="Hacken"
              width={99}
              height={22}
              className="object-contain"
            />
          </div>
          <Image
            src="/separator.svg"
            alt="Separator"
            width={3}
            height={72}
            className="object-contain"
          />
          <div className="flex items-center justify-between gap-2">
            <Image
              src="/icon-token-krain.svg"
              alt="Krain Token"
              width={54}
              height={54}
              className="object-contain"
            />
            <div className="flex flex-col items-start justify-start gap-2">
              <span className="text-sm text-[#8781BB]">Contract address:</span>
              <code className="text-sm text-white blur-sm">{address}</code>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              disabled
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
