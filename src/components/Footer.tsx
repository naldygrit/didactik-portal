import {
  FaLinkedin,
  FaInstagram,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-primary text-white py-12 mt-auto">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-serif font-bold mb-4">
              Didactik Media
            </h3>
            <p className="text-gray-500 text-sm">
              Preserving Africa's audiovisual heritage. Building essential
              archival infrastructure for the continent's creative economy.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-sm text-gray-500">
              <p>
                <a
                  href="mailto:emem@didactikmedia.com"
                  className="hover:text-secondary transition-colors flex items-center gap-2"
                >
                  <FaEnvelope className="text-secondary" />
                  emem@didactikmedia.com
                </a>
              </p>
              <p className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-secondary" />
                Lagos, Nigeria
              </p>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="space-y-2 text-sm">
              <p>
                <a
                  href="https://www.linkedin.com/company/didactik-media/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-secondary transition-colors flex items-center gap-2"
                >
                  <FaLinkedin className="text-secondary text-lg" />
                  Didactik Media
                </a>
              </p>
              
              <p>
                <a
                  href="https://instagram.com/didactikmedia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-secondary transition-colors flex items-center gap-2"
                >
                  <FaInstagram className="text-secondary text-lg" />
                  @didactikmedia
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Didactik Media. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
