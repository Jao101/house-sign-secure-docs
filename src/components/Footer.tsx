
import React from "react";
import { Link } from "react-router-dom";
import { FilePenLine } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <FilePenLine className="h-6 w-6 text-housesign-700" />
              <span className="text-xl font-bold text-housesign-800">HouseSign</span>
            </Link>
            <p className="text-gray-600 max-w-md">
              The open source document signing platform that makes it easy to send, sign, and manage documents securely.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="text-gray-600 hover:text-housesign-700 text-sm">Features</Link></li>
              <li><Link to="#" className="text-gray-600 hover:text-housesign-700 text-sm">Pricing</Link></li>
              <li><Link to="#" className="text-gray-600 hover:text-housesign-700 text-sm">Security</Link></li>
              <li><Link to="#" className="text-gray-600 hover:text-housesign-700 text-sm">Enterprise</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="text-gray-600 hover:text-housesign-700 text-sm">About</Link></li>
              <li><Link to="#" className="text-gray-600 hover:text-housesign-700 text-sm">Blog</Link></li>
              <li><Link to="#" className="text-gray-600 hover:text-housesign-700 text-sm">Careers</Link></li>
              <li><Link to="#" className="text-gray-600 hover:text-housesign-700 text-sm">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} HouseSign. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="#" className="text-gray-500 hover:text-housesign-700 text-sm">Privacy</Link>
            <Link to="#" className="text-gray-500 hover:text-housesign-700 text-sm">Terms</Link>
            <Link to="#" className="text-gray-500 hover:text-housesign-700 text-sm">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
