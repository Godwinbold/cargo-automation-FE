import { ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";

const DashboardFooter = ({ color, name }) => {
  return (
    <footer
      className={` text-white px-6 py-4 md:px-8`}
      style={{ backgroundColor: color }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
        {/* Left Section: Title and Description */}
        <div className="flex flex-col mt-10 md:mt-0  items-end md:items-end gap-1 md:gap-2 text-xs md:text-sm">
          <p className="opacity-75 text-sm">
            © {new Date().getFullYear()} CargoTrack solution | All rights
            reserved
          </p>
        </div>
        {/* Right Section: Copyright */}
        <div className="flex items-center text-sm gap-1 md:gap-2 max-w-md">
          <Link to="manage-shipping">Manage Shipment</Link> |
          <Link to="document">Documents</Link>
        </div>

        {/* Back to Top Link */}
        <a
          href="#top"
          className="flex flex-col self-end mt-10 md:mt-0 items-center gap-1 hover:text-blue-300 transition-colors opacity-80 hover:opacity-100"
        >
          <span className="text-[10px] animate-bounce bg-[#D3EBF8] h-8 w-8 flex items-center justify-center rounded-full ">
            <ArrowUp className="text-[#155C84]" />
          </span>
          <span className="text-xs"> Back to top</span>
        </a>
      </div>
    </footer>
  );
};

export default DashboardFooter;
