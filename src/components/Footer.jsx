import { ArrowUp } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#155C84] text-white px-6 py-4 md:px-12 lg:px-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
        {/* Left Section: Title and Description */}
        <div className="flex flex-col gap-1 md:gap-2 max-w-md">
          <div className="flex items-center gap-2">
            <img
              src="/icons/logo.svg"
              alt="CargoTrack Logo"
              className="h-10 w-auto"
            />
          </div>
          <p className="text-sm text-center sm:text-left leading-relaxed opacity-90">
            Access dedicated cargo names for our partner airlines with real-time
            tracking and management tools
          </p>
        </div>

        {/* Right Section: Copyright */}
        <div className="flex flex-col mt-10 md:mt-0  items-end md:items-end gap-1 md:gap-2 text-xs md:text-sm">
          <p className="opacity-75">
            © {new Date().getFullYear()} CargoTrack solution | All rights
            reserved
          </p>
        </div>

        {/* Back to Top Link */}
        <a
          href="#top"
          className="flex flex-col self-end mt-10 md:mt-0 items-center gap-1 hover:text-blue-300 transition-colors opacity-80 hover:opacity-100"
        >
          <span className="text-[10px] animate-bounce bg-[#D3EBF8] h-10 w-10 flex items-center justify-center rounded-full ">
            <ArrowUp className="text-[#155C84]" />
          </span>
          <span className="text-xs"> Back to top</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
