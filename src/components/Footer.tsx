import Link from "next/link";

const Footer = () => {
  return (
    <footer className="px-4 py-6">
      <div className="flex justify-center text-center items-center flex-wrap gap-2">
        <p className="text-muted-foreground">© 2024 Krain</p>
        <nav>
          <Link href="/terms" className="text-blue-600 hover:text-blue-800">
            Terms of Service
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
