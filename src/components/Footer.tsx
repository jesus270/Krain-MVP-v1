import Link from "next/link";

const Footer = () => {
  return (
    <footer className="flex justify-center text-center items-center flex-wrap gap-2 px-4 py-6">
      <p className="text-muted-foreground">
        © {new Date().getFullYear()} Krain
      </p>
      <nav>
        <Link href="/terms" className="text-blue-600 hover:text-blue-800">
          Terms and Conditions
        </Link>
      </nav>
    </footer>
  );
};

export default Footer;
