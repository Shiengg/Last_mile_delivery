import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaArrowLeft,
  FaRegClock,
  FaShieldAlt,
  FaRegFileAlt,
  FaLock,
  FaCopyright,
  FaEnvelope,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
  FaUniversity,
  FaUserGraduate,
  FaUsers,
  FaFingerprint,
  FaRegEye,
  FaRegThumbsUp,
} from "react-icons/fa"

const Privacy = () => {
  const navigate = useNavigate()
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

  const sections = [
    {
      id: 1,
      title: "Mục đích và phạm vi",
      icon: <FaShieldAlt className="h-6 w-6" />,
      description: "Hệ thống này được phát triển như một phần của đồ án môn học, nhằm mục đích:",
      items: [
        "Nghiên cứu và học tập về hệ thống quản lý giao hàng",
        "Thực hành phát triển ứng dụng web",
        "Tìm hiểu về quy trình giao hàng chặng cuối",
        "Áp dụng kiến thức đã học vào thực tế",
      ],
    },
    {
      id: 2,
      title: "Dữ liệu và bảo mật",
      icon: <FaLock className="h-6 w-6" />,
      description: "Về việc xử lý dữ liệu trong hệ thống:",
      items: [
        "Dữ liệu được sử dụng chỉ mang tính chất minh họa",
        "Không lưu trữ thông tin nhạy cảm của người dùng",
        "Mọi thông tin đều được mã hóa cơ bản",
        "Dữ liệu có thể được xóa sau khi kết thúc môn học",
      ],
    },
    {
      id: 3,
      title: "Quyền sở hữu trí tuệ",
      icon: <FaCopyright className="h-6 w-6" />,
      description:
        "Đây là đồ án được phát triển cho mục đích học tập tại trường Đại học. Mọi quyền sở hữu trí tuệ thuộc về nhóm phát triển và giảng viên hướng dẫn.",
      items: [],
    },
  ]

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
                Chính sách bảo mật
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
            <h2 className="text-2xl font-bold mb-3">Bảo mật thông tin của bạn là ưu tiên hàng đầu</h2>
            <p className="text-sky-100 leading-relaxed">
              Đây là chính sách bảo mật của hệ thống quản lý giao hàng chặng cuối, được phát triển như một phần của đồ
              án môn học. Mọi thông tin và dữ liệu trong hệ thống này chỉ được sử dụng cho mục đích học tập và nghiên
              cứu.
            </p>
          </div>
          <div className="p-8 bg-white">
            <div className="flex items-start p-4 bg-sky-50 rounded-xl border border-sky-100">
              <FaLock className="text-sky-600 mt-1 mr-4 flex-shrink-0" />
              <p className="text-gray-700">
                Chúng tôi cam kết bảo vệ thông tin của bạn và đảm bảo rằng dữ liệu chỉ được sử dụng cho mục đích học
                tập. Vui lòng đọc kỹ chính sách này để hiểu cách chúng tôi xử lý thông tin.
              </p>
            </div>
          </div>
        </div>

        {/* Main Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <button
                className="w-full px-8 py-6 flex items-center justify-between focus:outline-none"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mr-4">
                    {section.icon}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                </div>
                {isSectionExpanded(section.id) ? (
                  <FaChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <FaChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>

              {isSectionExpanded(section.id) && (
                <div className="px-8 pb-6 pt-2 animate-fadeIn">
                  <p className="text-gray-600 leading-relaxed mb-4">{section.description}</p>
                  {section.items && section.items.length > 0 && (
                    <div className="space-y-3">
                      {section.items.map((item, index) => (
                        <div key={index} className="flex items-start">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mr-3">
                            <FaCheck className="h-3 w-3" />
                          </div>
                          <p className="text-gray-600">{item}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Data Protection Features */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mr-3">
                <FaFingerprint className="h-5 w-5" />
              </div>
              <h4 className="font-medium text-gray-900">Bảo mật dữ liệu</h4>
            </div>
            <p className="text-gray-600">Chúng tôi sử dụng các biện pháp bảo mật cơ bản để bảo vệ dữ liệu.</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mr-3">
                <FaRegEye className="h-5 w-5" />
              </div>
              <h4 className="font-medium text-gray-900">Minh bạch</h4>
            </div>
            <p className="text-gray-600">Chúng tôi luôn minh bạch về cách thu thập và sử dụng dữ liệu.</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mr-3">
                <FaUsers className="h-5 w-5" />
              </div>
              <h4 className="font-medium text-gray-900">Quyền kiểm soát</h4>
            </div>
            <p className="text-gray-600">Bạn có quyền yêu cầu xem, sửa đổi hoặc xóa dữ liệu của mình.</p>
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
            <p className="text-gray-600 mb-6">Mọi thắc mắc về chính sách bảo mật, vui lòng liên hệ với chúng tôi:</p>
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
                Đã đồng ý với chính sách bảo mật
              </>
            ) : (
              "Tôi đồng ý với chính sách bảo mật"
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

export default Privacy
