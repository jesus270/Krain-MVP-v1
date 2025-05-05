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

        <TagChip
          icon={<HammerIcon className="w-4 h-4 text-[#6237EF]" />}
          text="Timeline"
          className="mb-6 self-start"
        />

        <h2 className="text-3xl sm:text-4xl font-bold mb-3">Vesting Info</h2>
        <p className="text-sm sm:text-base text-gray-300 mb-8">
          The information below is how the $KRAIN token benefits will be
          distributed.
        </p>

        <div className="space-y-6 mt-10">
          <div className="flex items-start gap-4">
            <div className="flex flex-col">
              <h3 className="text-lg sm:text-xl font-semibold">
                Cliff Time Period
              </h3>
              <p className="text-sm sm:text-base text-gray-400">
                $KRAIN tokens will be start to be distributed after a 1 month
                cliff. The cliff will start at the TGE date. First token
                distribution will be at the end of the 1st month after the TGE.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex flex-col">
              <h3 className="text-lg sm:text-xl font-semibold">
                Vesting Time Period
              </h3>
              <p className="text-sm sm:text-base text-gray-400">
                $KRAIN tokens will be distributed over a 12 month period of
                time. You will be able to claim these tokens each month as they
                unlock. 1/12th of the total tokens will be distributed each
                month.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex flex-col">
              <h3 className="text-lg sm:text-xl font-semibold">
                Token Distribution Method
              </h3>
              <p className="text-sm sm:text-base text-gray-400">
                You will login to a token management platform to claim your
                tokens.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
