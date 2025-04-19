import { TagChip } from "@/components/tag-chip";
import { CalendarIcon } from "lucide-react";

const scheduleItems = [
  {
    date: "MAY 5",
    time: "4PM UTC",
    title: "Whitelist Sale",
    description: "1st hour of sale",
  },
  {
    date: "MAY 6",
    time: "5PM UTC",
    title: "Private Period",
    description: "Open to the public",
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
          KRAIN Founders Key mint goes live on MAY 6 at 4PM UTC.
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
      </div>
    </section>
  );
}
