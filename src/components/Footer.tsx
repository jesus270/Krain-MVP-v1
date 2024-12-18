import Link from "next/link";

const Footer = () => {
  return (
    <footer className="flex justify-center text-center items-center flex-wrap gap-2 px-4 py-6">
      <p className="text-muted-foreground">© 2024 Krain</p>
      <nav>
        <Link href="/terms" className="text-blue-600 hover:text-blue-800">
          Terms of Service
        </Link>
      </nav>
    </footer>
  );
};

export default Footer;
