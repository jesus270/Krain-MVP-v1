export default function HomePage() {
  return (
    <main className="flex-grow flex flex-col items-center justify-center p-4 text-center min-h-screen bg-gray-950">
      <div className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6">KRAIN Founders Key Whitelist</h1>
        <p className="text-lg sm:text-xl text-gray-200 mb-4">
          <span className="font-semibold text-red-400">The KRAIN Founders Key Whitelist is closed.</span>
        </p>
        <p className="text-base sm:text-lg text-gray-300 mb-4">
          If you did not register for the whitelist, you may still participate in the public sale, subject to remaining supply.
        </p>
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <div className="text-gray-100 mb-2">
            <span className="font-semibold">Whitelist Sale</span> – May 6 at 2PM UTC
          </div>
          <div className="text-gray-100 mb-2">
            <span className="font-semibold">Public Sale</span> – May 6 at 6PM UTC
          </div>
          <div className="text-gray-100">
            The sale will be on the ArenaVS marketplace.
          </div>
        </div>
        <a
          href="https://krain.arenavs.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors"
        >
          Go to ArenaVS Marketplace
        </a>
      </div>
    </main>
  );
}
