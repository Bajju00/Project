import React from 'react';
import img from '../assets/M1.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer  className="bg-gradient-to-r from-blue-950 to-blue-900 text-white rounded-t-[20px]">
      <div className="container mx-auto px-6 py-4">

    <div className="grid md:grid-cols-5 gap-10">

      {/* Brand */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <img
            src={img}
            alt="LifeLink"
            className="w-12 h-12"
          />

          <div>
            <h3 className="text-2xl font-bold">
              LifeLink
            </h3>
            <p className="text-sm text-blue-200">
              Emergency Healthcare
            </p>
          </div>
        </div>

        <p className="text-blue-200">
          Connecting lives to care in real-time.
          Because every second matters.
        </p>
      </div>

      {/* Quick Links */}
      <div>
        <h4 className="font-semibold mb-4">
          Quick Links
        </h4>

        <ul className="space-y-2 text-blue-200">
          <li>Home</li>
          <li>Hospitals</li>
          <li>Ambulances</li>
          <li>Blood Donors</li>
          <li>About Us</li>
        </ul>
      </div>

      {/* Emergency */}
      <div>
        <h4 className="font-semibold mb-4">
          Emergency Contacts
        </h4>

        <div className="space-y-3">
          <p className="text-xl font-bold">📞 108</p>
          <p className="text-blue-200">
            Emergency Helpline
          </p>

          <p className="text-xl font-bold">
            📞 1800 123 4567
          </p>
          <p className="text-blue-200">
            Support Helpline
          </p>
        </div>
      </div>

      {/* Company */}
      <div>
        <h4 className="font-semibold mb-4">
          Company
        </h4>

        <ul className="space-y-2 text-blue-200">
          <li>About Us</li>
          <li>Careers</li>
          <li>Privacy Policy</li>
          <li>Terms & Conditions</li>
        </ul>
      </div>

      {/* Newsletter */}
      <div>
        <h4 className="font-semibold mb-4">
          Newsletter
        </h4>

        <p className="text-blue-200 mb-3">
          Subscribe for updates & health tips.
        </p>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full p-3 rounded-lg text-black outline-none"
        />

        <button className="mt-3 bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg font-medium transition">
          Subscribe
        </button>
      </div>

    </div>

    <div className="border-t border-blue-800 mt-10 pt-6 text-center text-blue-300">
      © {currentYear} LifeLink Emergency Healthcare. All Rights Reserved.
    </div>
  </div>
  </footer>
  );
};

export default Footer;