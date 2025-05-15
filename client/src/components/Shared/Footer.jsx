"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  FiMapPin,
  FiMail,
  FiPhone,
  FiClock,
  FiTruck,
  FiShield,
  FiHelpCircle,
  FiSend,
  FiGlobe,
  FiChevronDown,
  FiChevronUp,
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiLinkedin,
  FiYoutube,
  FiArrowRight,
} from "react-icons/fi"
import { FaGooglePlay, FaApple } from "react-icons/fa"

const Footer = () => {
  const navigate = useNavigate()
  const [expandedSection, setExpandedSection] = useState(null)
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null)
    } else {
      setExpandedSection(section)
    }
  }

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) {
      // Here you would typically call an API to subscribe the user
      setIsSubscribed(true)
      setTimeout(() => {
        setIsSubscribed(false)
        setEmail("")
      }, 3000)
    }
  }

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-b from-white to-sky-50 border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-sky-500 to-sky-600 p-3 rounded-xl shadow-md mr-3">
                <FiTruck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Last Mile</h3>
                <p className="text-sky-600 font-medium">Delivery</p>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed">
              Dịch vụ giao hàng chặng cuối nhanh chóng, an toàn và đáng tin cậy. Chúng tôi cam kết mang đến trải nghiệm
              giao hàng tốt nhất cho khách hàng.
            </p>

            <div className="space-y-3">
              <div className="flex items-start">
                <FiMapPin className="text-sky-500 mt-1 mr-2 flex-shrink-0" />
                <p className="text-gray-600">123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM</p>
              </div>
              <div className="flex items-center">
                <FiMail className="text-sky-500 mr-2 flex-shrink-0" />
                <a href="mailto:contact@lastmile.vn" className="text-gray-600 hover:text-sky-600 transition-colors">
                  contact@lastmile.vn
                </a>
              </div>
              <div className="flex items-center">
                <FiPhone className="text-sky-500 mr-2 flex-shrink-0" />
                <a href="tel:1900123456" className="text-gray-600 hover:text-sky-600 transition-colors">
                  1900 123 456
                </a>
              </div>
              <div className="flex items-center">
                <FiClock className="text-sky-500 mr-2 flex-shrink-0" />
                <p className="text-gray-600">08:00 - 18:00, Thứ 2 - Thứ 7</p>
              </div>
            </div>
          </div>

          {/* Quick Links - Desktop */}
          <div className="hidden md:block">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Liên kết nhanh</h3>
            <ul className="space-y-3">
              {[
                { label: "Trang chủ", path: "/" },
                { label: "Dịch vụ", path: "/services" },
                { label: "Tra cứu đơn hàng", path: "/tracking" },
                { label: "Bảng giá", path: "/pricing" },
                { label: "Về chúng tôi", path: "/about" },
                { label: "Tuyển dụng", path: "/careers" },
                { label: "Tin tức", path: "/news" },
                { label: "Liên hệ", path: "/contact" },
              ].map((link, index) => (
                <li key={index}>
                  <a href={link.path} className="text-gray-600 hover:text-sky-600 transition-colors flex items-center">
                    <FiArrowRight className="mr-2 h-3 w-3 text-sky-500" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links - Mobile */}
          <div className="md:hidden">
            <button
              onClick={() => toggleSection("links")}
              className="flex items-center justify-between w-full text-lg font-semibold text-gray-900 mb-4"
            >
              <span>Liên kết nhanh</span>
              {expandedSection === "links" ? (
                <FiChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <FiChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>
            {expandedSection === "links" && (
              <ul className="space-y-3 mb-6 animate-fadeIn">
                {[
                  { label: "Trang chủ", path: "/" },
                  { label: "Dịch vụ", path: "/services" },
                  { label: "Tra cứu đơn hàng", path: "/tracking" },
                  { label: "Bảng giá", path: "/pricing" },
                  { label: "Về chúng tôi", path: "/about" },
                  { label: "Tuyển dụng", path: "/careers" },
                  { label: "Tin tức", path: "/news" },
                  { label: "Liên hệ", path: "/contact" },
                ].map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.path}
                      className="text-gray-600 hover:text-sky-600 transition-colors flex items-center"
                    >
                      <FiArrowRight className="mr-2 h-3 w-3 text-sky-500" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Services - Desktop */}
          <div className="hidden md:block">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Dịch vụ của chúng tôi</h3>
            <ul className="space-y-3">
              {[
                { label: "Giao hàng nhanh", icon: <FiTruck className="text-sky-500" /> },
                { label: "Giao hàng tiêu chuẩn", icon: <FiTruck className="text-sky-500" /> },
                { label: "Giao hàng quốc tế", icon: <FiGlobe className="text-sky-500" /> },
                { label: "Giao hàng hẹn giờ", icon: <FiClock className="text-sky-500" /> },
                { label: "Giao hàng bảo mật", icon: <FiShield className="text-sky-500" /> },
                { label: "Hỗ trợ khách hàng 24/7", icon: <FiHelpCircle className="text-sky-500" /> },
              ].map((service, index) => (
                <li key={index}>
                  <a href="/services" className="text-gray-600 hover:text-sky-600 transition-colors flex items-center">
                    <span className="mr-2">{service.icon}</span>
                    {service.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services - Mobile */}
          <div className="md:hidden">
            <button
              onClick={() => toggleSection("services")}
              className="flex items-center justify-between w-full text-lg font-semibold text-gray-900 mb-4"
            >
              <span>Dịch vụ của chúng tôi</span>
              {expandedSection === "services" ? (
                <FiChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <FiChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>
            {expandedSection === "services" && (
              <ul className="space-y-3 mb-6 animate-fadeIn">
                {[
                  { label: "Giao hàng nhanh", icon: <FiTruck className="text-sky-500" /> },
                  { label: "Giao hàng tiêu chuẩn", icon: <FiTruck className="text-sky-500" /> },
                  { label: "Giao hàng quốc tế", icon: <FiGlobe className="text-sky-500" /> },
                  { label: "Giao hàng hẹn giờ", icon: <FiClock className="text-sky-500" /> },
                  { label: "Giao hàng bảo mật", icon: <FiShield className="text-sky-500" /> },
                  { label: "Hỗ trợ khách hàng 24/7", icon: <FiHelpCircle className="text-sky-500" /> },
                ].map((service, index) => (
                  <li key={index}>
                    <a
                      href="/services"
                      className="text-gray-600 hover:text-sky-600 transition-colors flex items-center"
                    >
                      <span className="mr-2">{service.icon}</span>
                      {service.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Newsletter & App Download */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Đăng ký nhận tin</h3>
            <p className="text-gray-600 mb-4">Nhận thông tin mới nhất về dịch vụ và khuyến mãi của chúng tôi.</p>

            <form onSubmit={handleSubscribe} className="mb-6">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email của bạn"
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sky-600 hover:text-sky-700 transition-colors"
                  aria-label="Đăng ký"
                >
                  <FiSend className="h-5 w-5" />
                </button>
              </div>
              {isSubscribed && (
                <p className="text-green-600 text-sm mt-2 animate-fadeIn">Cảm ơn bạn đã đăng ký nhận tin!</p>
              )}
            </form>

            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tải ứng dụng</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#"
                className="flex items-center bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <FaGooglePlay className="h-6 w-6 mr-2" />
                <div>
                  <div className="text-xs">Tải về từ</div>
                  <div className="text-sm font-medium">Google Play</div>
                </div>
              </a>
              <a
                href="#"
                className="flex items-center bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <FaApple className="h-6 w-6 mr-2" />
                <div>
                  <div className="text-xs">Tải về từ</div>
                  <div className="text-sm font-medium">App Store</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media & Copyright */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-4 mb-4 md:mb-0">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-sky-100 hover:text-sky-600 transition-colors"
                aria-label="Facebook"
              >
                <FiFacebook />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-sky-100 hover:text-sky-600 transition-colors"
                aria-label="Instagram"
              >
                <FiInstagram />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-sky-100 hover:text-sky-600 transition-colors"
                aria-label="Twitter"
              >
                <FiTwitter />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-sky-100 hover:text-sky-600 transition-colors"
                aria-label="LinkedIn"
              >
                <FiLinkedin />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-sky-100 hover:text-sky-600 transition-colors"
                aria-label="YouTube"
              >
                <FiYoutube />
              </a>
            </div>

            <div className="text-center md:text-right">
              <p className="text-gray-600 text-sm">
                &copy; {currentYear} Last Mile Delivery. Tất cả quyền được bảo lưu.
              </p>
              <div className="flex flex-wrap justify-center md:justify-end mt-2 text-sm text-gray-500 gap-x-4 gap-y-1">
                <a href="/privacy" className="hover:text-sky-600 transition-colors">
                  Chính sách bảo mật
                </a>
                <a href="/terms" className="hover:text-sky-600 transition-colors">
                  Điều khoản sử dụng
                </a>
                <a href="/sitemap" className="hover:text-sky-600 transition-colors">
                  Sơ đồ trang
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </footer>
  )
}

export default Footer
