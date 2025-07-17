
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Facebook, Instagram, Linkedin, Twitter, MapPin, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-b from-green-50 to-white border-t border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Left Column - Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-green-600" />
              <span className="text-xl font-bold text-gray-900">NourishSA</span>
            </div>
            <p className="text-sm text-green-600 font-medium">Connecting Surplus. Feeding Hope.</p>
            <p className="text-gray-600 text-sm leading-relaxed">
              NourishSA is a community-driven platform fighting food insecurity in South Africa.
            </p>
          </div>

          {/* Middle Column - Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Links</h3>
            <div className="space-y-2">
              {[
                { name: 'Home', path: '/' },
                { name: 'Surplus Matcher', path: '/surplus' },
                { name: 'Volunteer', path: '/volunteer' },
                { name: 'Food Hubs', path: '/hubs' },
                { name: 'Impact Stories', path: '/about' }
              ].map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="block text-gray-600 hover:text-green-600 text-sm transition-colors duration-200 hover:underline"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column - Contact & Social */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-green-600" />
                <span>Head Office: Johannesburg, South Africa</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-green-600" />
                <span>hello@nourishsa.org</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-4 w-4 text-green-600" />
                <span>+27 12 345 6789</span>
              </div>
            </div>
            
            {/* Social Icons */}
            <div className="flex space-x-4 pt-2">
              {[
                { icon: Facebook, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Linkedin, href: '#' },
                { icon: Twitter, href: '#' }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="text-gray-400 hover:text-green-600 transition-colors duration-200 hover:shadow-lg hover:shadow-green-400/25 rounded-full p-1"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-green-100 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-sm text-gray-600">© 2025 NourishSA. All Rights Reserved.</p>
          <p className="text-sm text-gray-500 italic">Proudly built by local volunteers.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
