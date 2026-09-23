// components/Footer.jsx
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, MapPin, Phone, Mail, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-pink-100 mt-auto">
      <div className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🍔</span>
              <span className="text-xl font-extrabold text-gradient-pink">BlushBites</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Fresh, delicious food delivered to your door in 30 minutes. Made with love and a pinch of pink! 🌸
            </p>
            <div className="flex gap-3">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-full bg-blush-50 flex items-center justify-center
                                              text-blush-500 hover:bg-blush-500 hover:text-white transition-all duration-200">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-[#333333] mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              {[['Home', '/'], ['Menu', '/menu'], ['My Orders', '/orders'], ['Profile', '/profile']].map(([label, path]) => (
                <li key={path}>
                  <Link to={path} className="hover:text-blush-500 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-[#333333] mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              {['🍔 Burgers', '🍕 Pizzas', '🍜 Asian Bowls', '🍰 Desserts', '🥗 Salads', '🥤 Drinks'].map((cat) => (
                <li key={cat}>
                  <Link to="/menu" className="hover:text-blush-500 transition-colors">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-[#333333] mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-blush-400 mt-0.5 shrink-0" />
                <span>123 Blossom Street, Pink City, CA 90210</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-blush-400 shrink-0" />
                <span>+1 (555) 0100</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-blush-400 shrink-0" />
                <span>hello@blushbites.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-pink-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">
            © 2024 BlushBites. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            Made with <Heart size={12} className="text-blush-400 fill-blush-400" /> by the BlushBites Team
          </p>
        </div>
      </div>
    </footer>
  );
}
