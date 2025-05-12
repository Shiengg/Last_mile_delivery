import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaArrowLeft,
  FaRegClock,
  FaRegLightbulb,
  FaRegFileAlt,
  FaShieldAlt,
  FaCopyright,
  FaEnvelope,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
  FaInfoCircle,
  FaUniversity,
  FaUserGraduate,
  FaUsers,
} from "react-icons/fa"

const Terms = () => {
  const navigate = useNavigate()
  // Changed the initial state to null, which means all sections are expanded initially
  const [expandedSections, setExpandedSections] = useState([1, 2, 3, 4])
  const [hasAccepted, setHasAccepted] = useState(false)

  const toggleSection = (sectionId) => {
    setExpandedSections((prevSections) => {
      // If section is already in the array, remove it (collapse)
      if (prevSections.includes(sectionId)) {
        return prevSections.filter((id) => id !== sectionId)
      }
      // Otherwise add it to the array (expand)
      else {
        return [...prevSections, sectionId]
      }
    })
  }

  const isSectionExpanded = (sectionId) => {
    return expandedSections.includes(sectionId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-1 z-40 print:static print:shadow-none">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 text-sky-600 hover:text-sky-700 transition-colors p-2 rounded-full hover:bg-sky-50 print:hidden"
                aria-label="Quay lại"
              >
                <FaArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FaRegFileAlt className="mr-3 text-sky-600" />
                Điều khoản sử dụng
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-sky-600 to-blue-700 px-8 py-6 text-white">
            <div className="flex items-center text-sm mb-2">
              <FaRegClock className="mr-2" />
              <span>Cập nhật lần cuối: 15/03/2024</span>
            </div>
            <h2 className="text-2xl font-bold mb-3">Chào mừng bạn đến với Last Mile Delivery</h2>
            <p className="text-sky-100 leading-relaxed">
              Đây là điều khoản sử dụng của hệ thống quản lý giao hàng chặng cuối, được phát triển như một phần của đồ
              án môn học. Chúng tôi đã cố gắng làm cho điều khoản này dễ hiểu và thân thiện nhất có thể.
            </p>
          </div>
          <div className="p-8 bg-white">
            <div className="flex items-start p-4 bg-sky-50 rounded-xl border border-sky-100">
              <FaInfoCircle className="text-sky-600 mt-1 mr-4 flex-shrink-0" />
              <p className="text-gray-700">
                Vui lòng đọc kỹ các điều khoản dưới đây trước khi sử dụng hệ thống. Việc sử dụng hệ thống đồng nghĩa với
                việc bạn đã đồng ý với các điều khoản này.
              </p>
            </div>
          </div>
        </div>

        {/* Main Sections */}
        <div className="space-y-6">
          {/* Section 1 */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
              className="w-full px-8 py-6 flex items-center justify-between focus:outline-none"
              onClick={() => toggleSection(1)}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mr-4">
                  <FaRegLightbulb className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Mục đích sử dụng</h2>
              </div>
              {isSectionExpanded(1) ? (
                <FaChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <FaChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>

            {isSectionExpanded(1) && (
              <div className="px-8 pb-6 pt-2 animate-fadeIn">
                <p className="text-gray-600 leading-relaxed mb-4">
                  Hệ thống này được phát triển và sử dụng cho các mục đích sau:
                </p>
                <div className="space-y-3">
                  {[
                    "Mô phỏng quy trình giao hàng chặng cuối",
                    "Thử nghiệm và đánh giá hiệu quả của hệ thống",
                    "Phục vụ cho việc học tập và nghiên cứu",
                    "Minh họa các tính năng quản lý giao hàng",
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mr-3">
                        <FaCheck className="h-3 w-3" />
                      </div>
                      <p className="text-gray-600">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2 */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
              className="w-full px-8 py-6 flex items-center justify-between focus:outline-none"
              onClick={() => toggleSection(2)}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mr-4">
                  <FaUsers className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Quy định sử dụng</h2>
              </div>
              {isSectionExpanded(2) ? (
                <FaChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <FaChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>

            {isSectionExpanded(2) && (
              <div className="px-8 pb-6 pt-2 animate-fadeIn">
                <p className="text-gray-600 leading-relaxed mb-4">
                  Khi sử dụng hệ thống, người dùng cần tuân thủ các quy định sau:
                </p>
                <div className="space-y-3">
                  {[
                    "Tuân thủ quy định và hướng dẫn sử dụng",
                    "Không chia sẻ thông tin đăng nhập với người khác",
                    "Không sử dụng dữ liệu cho mục đích thương mại",
                    "Báo cáo các lỗi phát sinh (nếu có) cho nhóm phát triển",
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mr-3">
                        <FaCheck className="h-3 w-3" />
                      </div>
                      <p className="text-gray-600">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
              className="w-full px-8 py-6 flex items-center justify-between focus:outline-none"
              onClick={() => toggleSection(3)}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mr-4">
                  <FaShieldAlt className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Giới hạn trách nhiệm</h2>
              </div>
              {isSectionExpanded(3) ? (
                <FaChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <FaChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>

            {isSectionExpanded(3) && (
              <div className="px-8 pb-6 pt-2 animate-fadeIn">
                <p className="text-gray-600 leading-relaxed mb-4">
                  Đây là dự án học tập, do đó có một số giới hạn về trách nhiệm:
                </p>
                <div className="space-y-3">
                  {[
                    "Hệ thống có thể chưa hoàn thiện hoặc còn lỗi",
                    "Không đảm bảo tính liên tục của dịch vụ",
                    "Dữ liệu có thể bị xóa sau khi kết thúc môn học",
                    "Không chịu trách nhiệm về các thiệt hại phát sinh",
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mr-3">
                        <FaCheck className="h-3 w-3" />
                      </div>
                      <p className="text-gray-600">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 4 */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
              className="w-full px-8 py-6 flex items-center justify-between focus:outline-none"
              onClick={() => toggleSection(4)}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mr-4">
                  <FaCopyright className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Quyền sở hữu trí tuệ</h2>
              </div>
              {isSectionExpanded(4) ? (
                <FaChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <FaChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>

            {isSectionExpanded(4) && (
              <div className="px-8 pb-6 pt-2 animate-fadeIn">
                <p className="text-gray-600 leading-relaxed mb-4">
                  Tất cả quyền sở hữu trí tuệ liên quan đến hệ thống này thuộc về:
                </p>
                <div className="space-y-3">
                  {[
                    "Nhóm sinh viên phát triển dự án",
                    "Giảng viên hướng dẫn",
                    "Trường Đại học Công nghệ Thông tin - ĐHQG TP.HCM",
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mr-3">
                        <FaCheck className="h-3 w-3" />
                      </div>
                      <p className="text-gray-600">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-8 bg-gradient-to-r from-sky-50 to-blue-50 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-sky-100">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <FaEnvelope className="mr-3 text-sky-600" />
              Thông tin liên hệ
            </h3>
          </div>
          <div className="p-8">
            <p className="text-gray-600 mb-6">Mọi thắc mắc về điều khoản sử dụng, vui lòng liên hệ với chúng tôi:</p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-xl shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mr-3">
                    <FaUserGraduate className="h-5 w-5" />
                  </div>
                  <h4 className="font-medium text-gray-900">Giảng viên hướng dẫn</h4>
                </div>
                <p className="text-gray-600">Nguyễn Công Hoan</p>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mr-3">
                    <FaUsers className="h-5 w-5" />
                  </div>
                  <h4 className="font-medium text-gray-900">Sinh viên thực hiện</h4>
                </div>
                <p className="text-gray-600">Trần Nhật Tân - 22521312</p>
                <p className="text-gray-600">Nguyễn Duy Vũ - 22521693</p>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mr-3">
                    <FaUniversity className="h-5 w-5" />
                  </div>
                  <h4 className="font-medium text-gray-900">Trường</h4>
                </div>
                <p className="text-gray-600">Đại học Công nghệ Thông tin</p>
                <p className="text-gray-600">ĐHQG TP.HCM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Accept Terms Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setHasAccepted(!hasAccepted)}
            className={`flex items-center px-8 py-4 rounded-xl font-medium text-white shadow-sm transition-all ${hasAccepted ? "bg-green-600 hover:bg-green-700" : "bg-sky-600 hover:bg-sky-700"
              }`}
          >
            {hasAccepted ? (
              <>
                <FaCheck className="mr-2" />
                Đã đồng ý với điều khoản
              </>
            ) : (
              "Tôi đồng ý với điều khoản"
            )}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 mt-12 py-6 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>© 2024 Last Mile Delivery. Đồ án môn học.</p>
        </div>
      </footer>

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
    </div>
  )
}

export default Terms
