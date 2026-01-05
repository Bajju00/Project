import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">LifeLink</h3>
            <p className="text-gray-400">
              Real-time emergency healthcare locator system for faster medical assistance.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/hospitals" className="text-gray-400 hover:text-white transition-colors">
                  Find Hospitals
                </a>
              </li>
              <li>
                <a href="/ambulance" className="text-gray-400 hover:text-white transition-colors">
                  Book Ambulance
                </a>
              </li>
              <li>
                <a href="/blood-donors" className="text-gray-400 hover:text-white transition-colors">
                  Blood Donors
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4">Emergency Contacts</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Ambulance: 108</li>
              <li>Police: 100</li>
              <li>Fire: 101</li>
              <li>Women Helpline: 1091</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Email: support@lifelink.com</li>
              <li>Phone: +91 1800-123-4567</li>
              <li>Address: 123 Health Street, Medical City</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} LifeLink Emergency Healthcare Locator. All rights reserved.</p>
          <p className="mt-2 text-sm">Built with ❤️ for emergency healthcare management</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;