"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Bell, Package, Search, ChevronDown, LogOut, User } from "lucide-react"
import authService from "../../services/authService"
import axios from "axios"
import { toast } from "react-hot-toast"
import { useNotifications } from "../../contexts/NotificationContext"

const Header = ({ title }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { notifications, unreadCount, updateNotifications } = useNotifications()
  const [userInfo, setUserInfo] = useState({
    name: "",
    role: "",
    displayRole: "",
    avatar: "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff",
  })
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640)
  const notificationRef = useRef(null)
  const profileRef = useRef(null)
  const searchRef = useRef(null)

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.success) {
          const userData = response.data.data
          const role = userData.role

          const userDisplayInfo = {
            Admin: {
              name: userData.fullName || "Admin User",
              displayRole: "System Administrator",
            },
            DeliveryStaff: {
              name: userData.fullName || "Delivery Staff",
              displayRole: "Delivery staff",
            },
            Customer: {
              name: userData.fullName || "Customer",
              displayRole: "Customer",
            },
          }

          setUserInfo({
            name: userDisplayInfo[role]?.name || "User",
            role: role,
            displayRole: userDisplayInfo[role]?.displayRole || "User",
            avatar:
              userData.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.fullName || "User")}&background=0D8ABC&color=fff`,
          })
        }
      } catch (error) {
        console.error("Error fetching user info:", error)
      }
    }

    fetchUserInfo()
  }, [])

  // Check if current screen is a customer screen
  const isCustomerScreen =
    location.pathname.includes("/customer") || location.pathname === "/settings" || location.pathname === "/profile"

  // Fetch notifications only for non-customer screens
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get("http://localhost:5000/api/activities/recent", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.success) {
          updateNotifications(response.data.data)
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
      }
    }

    if (!isCustomerScreen) {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [isCustomerScreen, updateNotifications])

  // Get activity icon style based on type
  const getActivityIconStyle = (type) => {
    switch (type) {
      case "CREATE":
        return "text-emerald-600 bg-emerald-100"
      case "UPDATE":
        return "text-amber-600 bg-amber-100"
      case "DELETE":
        return "text-rose-600 bg-rose-100"
      default:
        return "text-slate-600 bg-slate-100"
    }
  }

  // Get activity icon based on type
  const getActivityIcon = (type) => {
    switch (type) {
      case "CREATE":
        return (
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-100">
            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        )
      case "UPDATE":
        return (
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-100">
            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
        )
      case "DELETE":
        return (
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-rose-100">
            <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100">
            <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        )
    }
  }

  const handleLogout = () => {
    authService.logout()
    window.location.href = "/login"
  }

  const handleTitleClick = () => {
    const userRole = authService.getCurrentUserRole()
    if (userRole === "Admin" && location.pathname.includes("/admin-dashboard")) {
      navigate("/admin-dashboard")
    }
  }

  const handleClearNotifications = async () => {
    try {
      const token = localStorage.getItem("token")

      const response = await axios.delete("http://localhost:5000/api/activities/clear-notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.success) {
        updateNotifications([])
        toast.success("Notifications cleared")
      } else {
        throw new Error(response.data.message)
      }
    } catch (error) {
      console.error("Error clearing notifications:", error)
      toast.error(error.message || "Failed to clear notifications")
    }
  }

  const handleProfileClick = () => {
    const userRole = authService.getCurrentUserRole()
    let dashboardPath = "/"

    switch (userRole) {
      case "Admin":
        dashboardPath = "/admin-dashboard"
        break
      case "DeliveryStaff":
        dashboardPath = "/delivery-dashboard"
        break
      case "Customer":
        dashboardPath = "/customer-tracking"
        break
      default:
        dashboardPath = "/"
    }

    navigate(dashboardPath)
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div
            className={`flex items-center ${location.pathname.includes("/admin-dashboard")
              ? "cursor-pointer hover:opacity-80 transition-opacity duration-200"
              : ""
              }`}
            onClick={handleTitleClick}
          >
            <div className="flex-shrink-0 bg-gradient-to-r from-teal-500 to-emerald-500 p-2 rounded-lg shadow-md">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-slate-800">GiaoHangChat</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Last Mile Delivery Management</p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-1 sm:space-x-4">
            {/* Search Bar */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-full transition-colors duration-200"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              {isSearchOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg p-2 border border-slate-200">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm kiếm..."
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                      autoFocus
                    />
                    <div className="absolute left-3 top-2.5">
                      <Search className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Button - Hidden on customer screens */}
            {!isCustomerScreen && (
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-2 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-full transition-colors duration-200"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-rose-500 rounded-full min-w-[1.25rem] h-5">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotificationOpen && (
                  <div
                    className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg py-1 z-50 max-h-[28rem] overflow-y-auto border border-slate-200"
                    style={{
                      width: isMobile ? "calc(100vw - 2rem)" : "22rem",
                      right: isMobile ? "-3rem" : "0",
                    }}
                  >
                    <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
                      {notifications.length > 0 && (
                        <button
                          onClick={handleClearNotifications}
                          className="text-xs text-teal-600 hover:text-teal-800 font-medium"
                        >
                          Delete all
                        </button>
                      )}
                    </div>

                    <div className="divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-sm text-slate-500 text-center">
                          <div className="flex flex-col items-center">
                            <Bell className="h-10 w-10 text-slate-300 mb-2" />
                            <p>Không có thông báo</p>
                          </div>
                        </div>
                      ) : (
                        notifications.map((notification, index) => (
                          <div
                            key={notification._id || `notification-${index}`}
                            className="px-4 py-3 hover:bg-slate-50 transition-colors duration-200"
                          >
                            <div className="flex items-start space-x-3">
                              {getActivityIcon(notification.type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800">{notification.description}</p>
                                <p className="text-xs text-slate-500">bởi {notification.performedBy}</p>
                                <p className="text-xs text-slate-400 mt-1">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                className="flex items-center space-x-2 focus:outline-none p-1 rounded-full hover:bg-slate-100 transition-colors duration-200"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                aria-label="User menu"
              >
                <img
                  className="h-8 w-8 rounded-full ring-2 ring-teal-500 p-0.5"
                  src={userInfo.avatar || "/placeholder.svg"}
                  alt={userInfo.name}
                />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-slate-800">{userInfo.name}</p>
                  <p className="text-xs text-slate-500">{userInfo.displayRole}</p>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 border border-slate-200">
                  <div className="px-4 py-3 border-b border-slate-100 md:hidden">
                    <p className="text-sm font-medium text-slate-800">{userInfo.name}</p>
                    <p className="text-xs text-slate-500">{userInfo.displayRole}</p>
                  </div>

                  <a
                    href="/profile"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                  >
                    <User className="h-4 w-4 mr-3 text-slate-500" />
                    Thông tin cá nhân
                  </a>

                  <hr className="my-1 border-slate-100" />

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-3 text-rose-500" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
