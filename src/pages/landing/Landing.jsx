import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';
import { formatCurrency } from '../../utils/formatters';
import { BrochureModal } from '../../components/BrochureModal';
import { ApplicationFormModal } from '../../components/ApplicationFormModal';

export const Landing = () => {
  const { settings, loading } = useSettings();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [brochureOpen, setBrochureOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">{settings?.schoolName || 'HDM School'}</div>
          <nav className="hidden md:flex space-x-8">
            <a href="#home" className="text-gray-700 hover:text-primary">Home</a>
            <a href="#about" className="text-gray-700 hover:text-primary">About</a>
            <a href="#courses" className="text-gray-700 hover:text-primary">Courses</a>
            <a href="#contact" className="text-gray-700 hover:text-primary">Contacts</a>
          </nav>
          <Link to="/portal" className="bg-primary text-white px-5 py-2 rounded-full text-sm font-semibold shadow hover:bg-blue-700">
            Portal →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div id="home" className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{settings?.schoolName}</h1>
        <p className="text-xl mb-6">{settings?.motto || 'Technology for Tomorrow'}</p>
        <div className="flex justify-center gap-4">
          <button onClick={() => setBrochureOpen(true)} className="bg-white text-blue-700 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition">
            View Brochure
          </button>
          <button onClick={() => setApplyOpen(true)} className="bg-green-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-600 transition">
            Apply Now
          </button>
        </div>
      </div>

      {/* About */}
      <div id="about" className="container mx-auto px-6 py-16 grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-3xl font-bold text-blue-800 mb-4">About Us</h2>
          <p className="text-gray-600 mb-4">
            {settings?.landing?.aboutText || 'HDM Computer School offers certified courses in programming, networking, and design. Our state‑of‑the‑art labs and experienced instructors ensure you gain practical skills.'}
          </p>
          <p className="text-gray-600"><i className="fas fa-map-marker-alt text-blue-500 mr-2"></i> {settings?.address}</p>
          <p className="text-gray-600"><i className="fas fa-phone-alt text-blue-500 mr-2"></i> {settings?.phone}</p>
          <p className="text-gray-600"><i className="fas fa-envelope text-blue-500 mr-2"></i> {settings?.email}</p>
        </div>
        <div className="bg-gray-100 rounded-xl p-4">
          <img
            src={settings?.landing?.heroImage || 'https://placehold.co/600x400/eef2ff/2f86eb?text=School+Photos'}
            alt="School"
            className="rounded-lg shadow"
          />
        </div>
      </div>

      {/* Courses */}
      <div id="courses" className="bg-blue-50 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-10">Our Courses</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {(settings?.courses || []).map((course, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                <i className="fas fa-laptop-code text-3xl text-blue-600 mb-3"></i>
                <h3 className="font-bold text-xl">{course.name}</h3>
                <p className="text-gray-600 mt-2">
                  {course.durationMonths} months · {formatCurrency(course.totalFee)}
                </p>
                <button
                  className="mt-4 text-sm text-blue-600 underline hover:text-blue-800"
                  onClick={() => alert(`Course Details:\n\n${course.name}\nDuration: ${course.durationMonths} months\nFee: ${formatCurrency(course.totalFee)}\n\nContact us to enroll!`)}
                >
                  Download details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div id="contact" className="container mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-4">Find Us</h2>
        <div className="bg-gray-200 h-64 rounded-xl flex items-center justify-center text-gray-500">
          <div className="text-center">
            <i className="fas fa-map-marker-alt text-3xl mb-2 text-primary"></i>
            <p>{settings?.address || 'Nairobi, Kenya'}</p>
            <p className="mt-2">📞 {settings?.phone || '+254 700 123 456'}</p>
            <p>✉️ {settings?.email || 'info@hdmcomputerschool.ac.ke'}</p>
          </div>
        </div>
      </div>

      <footer className="bg-blue-900 text-white text-center py-6 text-sm">
        © {new Date().getFullYear()} {settings?.schoolName}. All rights reserved.
      </footer>

      {/* Modals */}
      <BrochureModal isOpen={brochureOpen} onClose={() => setBrochureOpen(false)} />
      <ApplicationFormModal isOpen={applyOpen} onClose={() => setApplyOpen(false)} />
    </div>
  );
};