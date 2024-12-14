import Link from "next/link";

const TermsOfService = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-block mb-6 text-blue-600 hover:text-blue-800"
      >
        ← Back
      </Link>
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="prose max-w-none">
        <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing and using this website, you accept and agree to be bound
          by the terms and provision of this agreement.
        </p>

        <h2 className="text-xl font-semibold mb-4">2. Use License</h2>
        <p className="mb-4">
          Permission is granted to temporarily download one copy of the
          materials (information or software) on this website for personal,
          non-commercial transitory viewing only.
        </p>

        <h2 className="text-xl font-semibold mb-4">3. Disclaimer</h2>
        <p className="mb-4">
          The materials on this website are provided on an &apos;as is&apos;
          basis. We make no warranties, expressed or implied, and hereby
          disclaim and negate all other warranties including, without
          limitation, implied warranties or conditions of merchantability,
          fitness for a particular purpose, or non-infringement of intellectual
          property or other violation of rights.
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;
