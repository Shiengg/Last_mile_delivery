"use client"

import { useState, useEffect, useRef } from "react"
import Header from "../components/Shared/Header"
import axios from "axios"
import { toast } from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import {
  FiCamera,
  FiArrowLeft,
  FiSave,
  FiMail,
  FiPhone,
  FiUser,
  FiLock,
  FiShield,
  FiEdit2,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiCalendar,
  FiSettings,
  FiHelpCircle,
  FiInfo,
  FiAlertCircle,
  FiLogOut,
  FiActivity,
  FiBell,
  FiStar,
} from "react-icons/fi"
import { motion, AnimatePresence } from "framer-motion"

const Profile = () => {
  const [userInfo, setUserInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    username: "",
    avatar: "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff",
    address: "123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM",
    joinDate: "01/01/2023",
    lastActive: new Date().toLocaleDateString("vi-VN"),
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [editMode, setEditMode] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [originalUserInfo, setOriginalUserInfo] = useState({})
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const profileSectionRef = useRef(null)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  // Scroll to profile section when tab changes
  useEffect(() => {
    if (profileSectionRef.current) {
      profileSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [activeTab])

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      const user = JSON.parse(localStorage.getItem("user"))

      if (!token || !user) {
        toast.error("Vui lòng đăng nhập lại")
        navigate("/login")
        return
      }

      const response = await axios.get("http://localhost:5000/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        const userData = response.data.data
        const enhancedUserData = {
          ...userData,
          avatar:
            userData.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.fullName || userData.username)}&background=0D8ABC&color=fff`,
          address: userData.address || "123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM",
          joinDate: userData.joinDate || "01/01/2023",
          lastActive: new Date().toLocaleDateString("vi-VN"),
        }

        setUserInfo(enhancedUserData)
        setOriginalUserInfo(enhancedUserData)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại")
        navigate("/login")
      } else {
        toast.error("Không thể tải thông tin hồ sơ")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleImageClick = () => {
    fileInputRef.current.click()
  }

  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error("Ảnh không được lớn hơn 5MB")
        return
      }

      // Simulate upload progress
      setUploadProgress(0)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      // Compress image before converting to base64
      const compressedFile = await compressImage(file)
      const reader = new FileReader()

      reader.onloadend = () => {
        setUserInfo((prev) => ({
          ...prev,
          avatar: reader.result,
        }))

        // Complete progress
        setUploadProgress(100)
        setTimeout(() => {
          setUploadProgress(0)
        }, 500)
      }
      reader.readAsDataURL(compressedFile)
    }
  }

  // Image compression function
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          const MAX_WIDTH = 800
          const MAX_HEIGHT = 800
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height
              height = MAX_HEIGHT
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext("2d")
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              resolve(
                new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                }),
              )
            },
            "image/jpeg",
            0.7,
          ) // Compress with 70% quality
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const response = await axios.put(
        "http://localhost:5000/api/users/profile",
        {
          fullName: userInfo.fullName,
          email: userInfo.email,
          phone: userInfo.phone,
          avatar: userInfo.avatar,
          address: userInfo.address,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (response.data.success) {
        setShowSuccessMessage(true)
        setTimeout(() => setShowSuccessMessage(false), 3000)

        const currentUser = JSON.parse(localStorage.getItem("user"))
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...currentUser,
            ...response.data.data,
          }),
        )
        setOriginalUserInfo({ ...userInfo })
        setEditMode(false)
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Cập nhật thông tin thất bại")
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    setUserInfo({ ...originalUserInfo })
    setEditMode(false)
  }

  const hasChanges = () => {
    return JSON.stringify(userInfo) !== JSON.stringify(originalUserInfo)
  }

  // Role badge renderer
  const getRoleBadge = (role) => {
    switch (role) {
      case "Admin":
        return (
          <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full text-sm font-medium shadow-sm">
            🌟 Quản trị viên
          </span>
        )
      case "DeliveryStaff":
        return (
          <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full text-sm font-medium shadow-sm">
            💁‍♂️ Nhân viên giao hàng
          </span>
        )
      default:
        return (
          <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-medium shadow-sm">
            🗣️ Người dùng
          </span>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-gray-50 to-sky-50">
      <Header title="Thông Tin Cá Nhân" />

      {loading ? (
        <LoadingState />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          {/* Success Message */}
          <AnimatePresence>
            {showSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-lg flex items-center"
                style={{ maxWidth: "90%" }}
              >
                <FiCheckCircle className="text-green-500 mr-3 flex-shrink-0" />
                <span>Thông tin đã được cập nhật thành công!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Profile Header */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 mb-8">
            <div className="relative h-60 sm:h-72 bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-full h-full">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute rounded-full bg-white opacity-10"
                        style={{
                          width: `${Math.random() * 300 + 100}px`,
                          height: `${Math.random() * 300 + 100}px`,
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                          animation: `float ${Math.random() * 20 + 20}s infinite ease-in-out`,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <svg
                  className="absolute left-0 bottom-0 h-16 w-full"
                  viewBox="0 0 1440 80"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                >
                  <path d="M0,64 C288,96 576,0 864,64 C1152,128 1440,32 1440,64 L1440,80 L0,80 Z" fill="white"></path>
                </svg>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent"></div>

              {/* Profile Info Overlay */}
              <div className="absolute bottom-6 left-0 right-0 px-6 sm:px-8 text-white">
                <div className="flex flex-col md:flex-row md:items-end gap-6">
                  {/* Avatar Upload Section */}
                  <div className="relative group">
                    <div
                      onClick={handleImageClick}
                      className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white p-1 shadow-lg cursor-pointer
                        transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
                    >
                      <img
                        src={userInfo.avatar || "/placeholder.svg"}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
                      />
                      <div
                        className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100
                        transition-all duration-300 flex flex-col items-center justify-center space-y-1"
                      >
                        <FiCamera className="w-6 h-6 text-white" />
                        <span className="text-xs text-white">Thay đổi ảnh</span>
                      </div>

                      {/* Upload Progress Indicator */}
                      {uploadProgress > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-full overflow-hidden">
                          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
                          <div className="z-10 flex flex-col items-center">
                            <svg className="w-12 h-12" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                              <circle
                                cx="18"
                                cy="18"
                                r="16"
                                fill="none"
                                stroke="#ffffff"
                                strokeWidth="2"
                                strokeDasharray="100"
                                strokeDashoffset="0"
                              />
                              <circle
                                cx="18"
                                cy="18"
                                r="16"
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="2"
                                strokeDasharray="100"
                                strokeDashoffset={100 - uploadProgress}
                              />
                              <text x="18" y="22" textAnchor="middle" fill="#ffffff" fontSize="8">
                                {uploadProgress}%
                              </text>
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-2">{userInfo.fullName || userInfo.username}</h2>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {getRoleBadge(userInfo.role)}
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                        ID: {userInfo.username}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
                      <div className="flex items-center">
                        <FiMail className="mr-1" />
                        {userInfo.email}
                      </div>
                      <div className="flex items-center">
                        <FiPhone className="mr-1" />
                        {userInfo.phone || "Chưa cập nhật"}
                      </div>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <div className="md:self-start mt-4 md:mt-0">
                    <button
                      type="button"
                      onClick={() => setEditMode(!editMode)}
                      className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${editMode
                        ? "bg-white text-sky-600 hover:bg-gray-100"
                        : "bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                        }`}
                    >
                      {editMode ? (
                        <>
                          <FiCheckCircle className="w-4 h-4" />
                          <span>Đang chỉnh sửa</span>
                        </>
                      ) : (
                        <>
                          <FiEdit2 className="w-4 h-4" />
                          <span>Chỉnh sửa</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div ref={profileSectionRef} className="border-b border-gray-200 sticky top-0 bg-white z-30 shadow-sm">
              <div className="px-6 sm:px-8 flex overflow-x-auto hide-scrollbar">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`py-4 px-4 font-medium text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === "profile"
                    ? "border-sky-500 text-sky-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  <FiUser className="inline-block mr-2" />
                  Thông tin cá nhân
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`py-4 px-4 font-medium text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === "security"
                    ? "border-sky-500 text-sky-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  <FiLock className="inline-block mr-2" />
                  Bảo mật
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === "profile" && (
                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Basic Info Section */}
                        <div className="space-y-6">
                          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                              <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center mr-3">
                                <FiUser className="w-4 h-4 text-sky-600" />
                              </div>
                              Thông tin cơ bản
                            </h3>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập</label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={userInfo.username}
                                    disabled
                                    className="w-full pl-10 pr-10 py-3 rounded-lg bg-white border border-gray-200 
                                      focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300"
                                  />
                                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={userInfo.fullName}
                                    onChange={(e) => setUserInfo({ ...userInfo, fullName: e.target.value })}
                                    disabled={!editMode}
                                    className={`w-full pl-10 py-3 rounded-lg border ${editMode ? "border-sky-200 bg-sky-50/50" : "border-gray-200 bg-white"
                                      } focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300`}
                                    placeholder="Nhập họ và tên của bạn"
                                  />
                                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò hệ thống</label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={
                                      userInfo.role === "Admin"
                                        ? "Quản trị viên"
                                        : userInfo.role === "DeliveryStaff"
                                          ? "Nhân viên giao hàng"
                                          : "Người dùng"
                                    }
                                    disabled
                                    className="w-full pl-10 pr-10 py-3 rounded-lg bg-white border border-gray-200 
                                      focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300"
                                  />
                                  <FiShield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    {userInfo.role === "Admin" ? "🌟" : userInfo.role === "DeliveryStaff" ? "💁‍♂️" : "🗣️"}
                                  </span>
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                                <div className="relative">
                                  <textarea
                                    value={userInfo.address}
                                    onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })}
                                    disabled={!editMode}
                                    rows={2}
                                    className={`w-full pl-10 py-3 rounded-lg border ${editMode ? "border-sky-200 bg-sky-50/50" : "border-gray-200 bg-white"
                                      } focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300`}
                                    placeholder="Nhập địa chỉ của bạn"
                                  />
                                  <FiMapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Activity Info */}
                          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                              <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center mr-3">
                                <FiActivity className="w-4 h-4 text-sky-600" />
                              </div>
                              Hoạt động
                            </h3>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-600">Ngày tham gia</span>
                                <span className="text-gray-900 font-medium flex items-center">
                                  <FiCalendar className="mr-1 text-sky-500" />
                                  {userInfo.joinDate}
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-600">Hoạt động gần đây</span>
                                <span className="text-gray-900 font-medium flex items-center">
                                  <FiClock className="mr-1 text-sky-500" />
                                  {userInfo.lastActive}
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600">Trạng thái</span>
                                <div className="flex items-center">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                  <span className="text-green-600 font-medium">Đang hoạt động</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Contact Info Section */}
                        <div className="space-y-6">
                          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                              <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center mr-3">
                                <FiPhone className="w-4 h-4 text-sky-600" />
                              </div>
                              Thông tin liên hệ
                            </h3>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <div className="relative">
                                  <input
                                    type="email"
                                    value={userInfo.email}
                                    onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                                    disabled={!editMode}
                                    className={`w-full pl-10 py-3 rounded-lg border ${editMode ? "border-sky-200 bg-sky-50/50" : "border-gray-200 bg-white"
                                      } focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300`}
                                    placeholder="example@email.com"
                                  />
                                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                                <div className="relative">
                                  <input
                                    type="tel"
                                    value={userInfo.phone}
                                    onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                                    disabled={!editMode}
                                    className={`w-full pl-10 py-3 rounded-lg border ${editMode ? "border-sky-200 bg-sky-50/50" : "border-gray-200 bg-white"
                                      } focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300`}
                                    placeholder="Nhập số điện thoại của bạn"
                                  />
                                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Verification Status */}
                          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                              <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center mr-3">
                                <FiCheckCircle className="w-4 h-4 text-sky-600" />
                              </div>
                              Trạng thái xác thực
                            </h3>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                  <FiMail className="w-5 h-5 mr-3 text-sky-500" />
                                  <span className="text-gray-700">Email</span>
                                </div>
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                  Đã xác thực
                                </span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                  <FiPhone className="w-5 h-5 mr-3 text-sky-500" />
                                  <span className="text-gray-700">Số điện thoại</span>
                                </div>
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                  Chưa xác thực
                                </span>
                              </div>
                            </div>

                            {!userInfo.phone && (
                              <div className="mt-4 p-3 bg-white rounded-lg border border-yellow-200 bg-yellow-50">
                                <div className="flex">
                                  <FiAlertCircle className="text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                                  <p className="text-sm text-yellow-700">
                                    Vui lòng cập nhật số điện thoại để xác thực tài khoản của bạn.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Last Updated Info */}
                          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-600 flex items-center">
                              <FiClock className="mr-2 text-sky-500" />
                              Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {editMode && (
                        <div className="flex flex-col sm:flex-row justify-end items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-300 text-gray-700
                              hover:bg-gray-50 transition-all duration-300 flex items-center justify-center space-x-2"
                          >
                            <span>Hủy thay đổi</span>
                          </button>

                          <button
                            type="submit"
                            disabled={saving || !hasChanges()}
                            className={`w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-sky-600 to-sky-700 text-white
                              rounded-xl transition-all duration-300
                              disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2
                              ${hasChanges()
                                ? "hover:from-sky-700 hover:to-sky-800 transform hover:scale-105 hover:shadow-lg"
                                : ""
                              }`}
                          >
                            {saving ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Đang lưu thay đổi...</span>
                              </>
                            ) : (
                              <>
                                <FiSave className="w-5 h-5" />
                                <span>Lưu thay đổi</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </form>
                  )}

                  {activeTab === "security" && (
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center mr-3">
                            <FiLock className="w-4 h-4 text-sky-600" />
                          </div>
                          Bảo mật tài khoản
                        </h3>
                        <p className="text-gray-600 mb-6">Quản lý các thiết lập bảo mật cho tài khoản của bạn.</p>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-sky-200 hover:shadow-sm transition-all">
                            <div>
                              <h4 className="font-medium text-gray-900">Đổi mật khẩu</h4>
                              <p className="text-sm text-gray-600">Cập nhật mật khẩu định kỳ để bảo vệ tài khoản</p>
                            </div>
                            <button className="px-4 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors">
                              Thay đổi
                            </button>
                          </div>

                          <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-sky-200 hover:shadow-sm transition-all">
                            <div>
                              <h4 className="font-medium text-gray-900">Xác thực hai yếu tố</h4>
                              <p className="text-sm text-gray-600">Tăng cường bảo mật với xác thực hai yếu tố</p>
                            </div>
                            <button className="px-4 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors">
                              Thiết lập
                            </button>
                          </div>

                          <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-sky-200 hover:shadow-sm transition-all">
                            <div>
                              <h4 className="font-medium text-gray-900">Phiên đăng nhập</h4>
                              <p className="text-sm text-gray-600">Quản lý các thiết bị đã đăng nhập</p>
                            </div>
                            <button className="px-4 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors">
                              Xem
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Back Button */}
          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700
                hover:bg-gray-50 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span>Quay lại</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Add CSS for animations and styling */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        @keyframes float {
          0% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
          100% {
            transform: translateY(0px) translateX(0px);
          }
        }
      `}</style>
    </div>
  )
}

// Loading State Component
const LoadingState = () => (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      <div className="animate-pulse">
        {/* Header Skeleton */}
        <div className="h-60 bg-gradient-to-r from-gray-200 to-gray-300" />

        {/* Avatar Skeleton */}
        <div className="relative px-8">
          <div className="absolute -top-16 flex items-end space-x-4">
            <div className="w-36 h-36 rounded-full bg-gray-300" />
            <div className="pb-4 space-y-2">
              <div className="h-8 w-48 bg-gray-300 rounded" />
              <div className="h-4 w-24 bg-gray-300 rounded" />
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="pt-24 px-8 border-b border-gray-200">
          <div className="flex space-x-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="h-64 bg-gray-100 rounded-xl p-6">
                <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-24 bg-gray-200 rounded" />
                      <div className="h-10 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-48 bg-gray-100 rounded-xl" />
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-gray-100 rounded-xl" />
              <div className="h-48 bg-gray-100 rounded-xl" />
              <div className="h-16 bg-gray-100 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default Profile
