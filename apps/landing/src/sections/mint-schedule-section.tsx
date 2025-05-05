import { TagChip } from "@/components/tag-chip";
import { CalendarIcon, HammerIcon } from "lucide-react";
import Link from "next/link";

const scheduleItems = [
  {
    date: "MAY 6th",
    time: "2PM UTC",
    title: "Whitelist Sale",
    description: "1st 4 hours of the sale, Whitelist Participants Only",
  },
  {
    date: "MAY 6th",
    time: "6PM UTC",
    title: "Public Sale",
    description: "Open to the Public",
  },
];

export function MintScheduleSection() {
  return (
    <section className="w-full text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col">
        <TagChip
          icon={<CalendarIcon className="w-4 h-4 text-[#6237EF]" />}
          text="Timeline"
          className="mb-6 self-start"
        />

        <h2 className="text-3xl sm:text-4xl font-bold mb-3">Mint Schedule</h2>
        <p className="text-sm sm:text-base text-gray-300 mb-8">
          KRAIN Founders Key mint goes live on MAY 6th at 2PM UTC.
        </p>
        <p className="text-sm sm:text-base text-gray-300 mb-8">
          The sale will take place on the{" "}
          <Link href="https://arenavs.com/marketplace" target="_blank">
            Arena VS Marketplace
          </Link>
          .
        </p>

        <div className="space-y-6">
          {scheduleItems.map((item, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex flex-col items-center justify-center text-center bg-gradient-to-b from-gray-700 to-gray-800 p-3 rounded-lg w-20 shrink-0">
                <span className="text-xs font-medium text-gray-300">
                  {item.date}
                </span>
                <span className="text-sm font-semibold text-white">
                  {item.time}
                </span>
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg sm:text-xl font-semibold">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-400">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        {/* Vesting Info Section */}

        <div className="mt-12">
          <TagChip
            icon={<HammerIcon className="w-4 h-4 text-[#6237EF]" />}
            text="Vesting"
            className="mb-6 self-start"
          />
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold mb-3">Vesting Info</h2>
        <p className="text-sm sm:text-base text-gray-300 mb-3">
          The information below is how the $KRAIN token benefits will be
          distributed.
        </p>

        <div className="space-y-6 mt-5">
          <div className="flex items-start gap-4">
            <div className="flex flex-col">
              <h3 className="text-lg sm:text-xl font-semibold">
                Cliff Time Period
              </h3>
              <p className="text-sm sm:text-base text-gray-400">
                $KRAIN token distributions will begin following a one-month
                cliff period, which starts on the Token Generation Event (TGE)
                date. The first distribution will occur at the end of the first
                month after the TGE.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex flex-col">
              <h3 className="text-lg sm:text-xl font-semibold">
                Vesting Time Period
              </h3>
              <p className="text-sm sm:text-base text-gray-400">
                $KRAIN tokens will be distributed over a 12-month vesting
                schedule, with 1/12th of the total allocation becoming claimable
                each month as it unlocks.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex flex-col">
              <h3 className="text-lg sm:text-xl font-semibold">
                Token Distribution Method
              </h3>
              <p className="text-sm sm:text-base text-gray-400">
                Token claims will be managed through a secure token management
                platform, where you will log in to access and claim your tokens.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
