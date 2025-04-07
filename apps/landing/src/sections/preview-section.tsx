import { UiPreview } from "@/components/ui-preview";

export function PreviewSection() {
  return (
    <section
      id="preview"
      className="flex flex-col items-center w-full py-24 md:py-32 px-4 md:px-20 bg-[#04030C]"
    >
      <div className="flex flex-col items-center w-full">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            The only AI app portal
            <br />
            you'll ever need
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl">
            Find high performing AI apps based on your exact criteria,
            performance requirements, and community ratings.
          </p>
        </div>
        <UiPreview />
      </div>
    </section>
  );
}
