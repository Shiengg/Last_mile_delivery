import { useState, useEffect } from "react"
import authService from "../services/authService"
import { useNavigate } from "react-router-dom"
import {
  FaUser,
  FaLock,
  FaTruck,
  FaEnvelope,
  FaPhone,
  FaUserCircle,
  FaArrowRight,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaExclamationCircle,
  FaMapMarkerAlt,
  FaClock,
  FaShieldAlt,
} from "react-icons/fa"

const Login = () => {
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "Customer",
    fullName: "",
    email: "",
    phone: "",
  })
  const [notification, setNotification] = useState({ type: "", message: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [animateForm, setAnimateForm] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Trigger entrance animation
    setAnimateForm(true)
  }, [])

  useEffect(() => {
    // Reset validation errors when switching modes
    setValidationErrors({})
  }, [isLoginMode])

  const validateField = (name, value) => {
    let error = ""

    switch (name) {
      case "username":
        if (value.length < 3) error = "Username must be at least 3 characters"
        break
      case "password":
        if (value.length < 6) error = "Password must be at least 6 characters"
        break
      case "email":
        if (!/\S+@\S+\.\S+/.test(value)) error = "Please enter a valid email"
        break
      case "phone":
        if (!/^\d{10,}$/.test(value)) error = "Please enter a valid phone number"
        break
      default:
        break
    }

    return error
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Live validation
    const error = validateField(name, value)
    setValidationErrors({
      ...validationErrors,
      [name]: error,
    })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setNotification({ type: "", message: "" })
    setIsLoading(true)

    try {
      const role = await authService.login(formData.username, formData.password)

      if (!role) {
        setNotification({
          type: "error",
          message: "Login failed. Please check your credentials.",
        })
        setIsLoading(false)
        return
      }

      // Success notification before redirect
      setNotification({
        type: "success",
        message: "Login successful! Redirecting...",
      })

      // Delay navigation for better UX
      setTimeout(() => {
        switch (role) {
          case "Admin":
            navigate("/admin-dashboard")
            break
          case "DeliveryStaff":
            navigate("/delivery-dashboard")
            break
          case "Customer":
            navigate("/customer-tracking")
            break
          default:
            setNotification({
              type: "error",
              message: "Invalid role received",
            })
            setIsLoading(false)
        }
      }, 1500)
    } catch (error) {
      setNotification({
        type: "error",
        message: error.message || "Login failed. Please try again.",
      })
      setIsLoading(false)

      if (process.env.NODE_ENV === "development") {
        console.log("Login error details:", error)
      }
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setNotification({ type: "", message: "" })
    setIsLoading(true)

    // Validate all fields
    let hasErrors = false
    const errors = {}

    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "role") {
        const error = validateField(key, value)
        if (error) {
          errors[key] = error
          hasErrors = true
        }
      }
    })

    if (hasErrors) {
      setValidationErrors(errors)
      setIsLoading(false)
      return
    }

    try {
      await authService.register(formData)
      setNotification({
        type: "success",
        message: "Registration successful! Please login.",
      })

      setTimeout(() => {
        setIsLoginMode(true)
        setFormData({
          ...formData,
          password: "",
          role: "Customer",
        })
        setIsLoading(false)
      }, 1500)
    } catch (error) {
      setNotification({
        type: "error",
        message: error.response?.data?.message || "Registration failed. Please try again.",
      })
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Branding and Info */}
      <div className="md:w-1/2 flex flex-col justify-center items-center p-8 md:p-16 bg-gradient-to-br from-sky-600 via-sky-700 to-blue-800 text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white opacity-5"
                style={{
                  width: `${Math.random() * 400 + 100}px`,
                  height: `${Math.random() * 400 + 100}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `float ${Math.random() * 20 + 20}s infinite ease-in-out`,
                }}
              />
            ))}
          </div>
          <svg
            className="absolute bottom-0 left-0 w-full opacity-10"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
          >
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,181.3C960,181,1056,203,1152,197.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>

        <div className="max-w-md relative z-10">
          <div className="flex items-center mb-10">
            <div className="bg-white p-4 rounded-2xl shadow-lg mr-5 transition-transform hover:scale-105 duration-300">
              <FaTruck className="h-10 w-10 text-sky-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Last Mile</h1>
              <h2 className="text-2xl font-semibold text-sky-200">Delivery</h2>
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
            {isLoginMode ? "Swift Delivery at Your Fingertips" : "Join Our Elite Delivery Network"}
          </h2>

          <p className="text-xl mb-10 opacity-90 leading-relaxed">
            {isLoginMode
              ? "Experience premium logistics with real-time tracking, secure delivery, and exceptional service."
              : "Create an account today and unlock a world of delivery possibilities with our state-of-the-art logistics network."}
          </p>

          <div className="space-y-8 mb-12">
            <div className="flex items-start">
              <div className="bg-gradient-to-br from-sky-400 to-sky-500 p-3 rounded-xl shadow-lg mr-5">
                <FaMapMarkerAlt className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-xl">Precision Tracking</h3>
                <p className="opacity-80 text-lg">Real-time GPS location monitoring</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-gradient-to-br from-sky-400 to-sky-500 p-3 rounded-xl shadow-lg mr-5">
                <FaClock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-xl">Express Delivery</h3>
                <p className="opacity-80 text-lg">Guaranteed on-time performance</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-gradient-to-br from-sky-400 to-sky-500 p-3 rounded-xl shadow-lg mr-5">
                <FaShieldAlt className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-xl">Secure Handling</h3>
                <p className="opacity-80 text-lg">End-to-end protected logistics</p>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-300 mr-1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="italic text-xl mb-4">
                "Last Mile Delivery has revolutionized our logistics operations with their intuitive platform and
                reliable service."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-300 to-blue-400 rounded-full mr-4 flex items-center justify-center text-blue-800 font-bold text-lg">
                  SJ
                </div>
                <div>
                  <p className="font-semibold text-lg">Sarah Johnson</p>
                  <p className="text-sm opacity-80">Operations Manager, TechCorp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="md:w-1/2 flex justify-center items-center p-8 bg-gradient-to-br from-gray-50 to-white">
        <div
          className={`w-full max-w-md transition-all duration-700 transform ${animateForm ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
        >
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-block p-3 bg-sky-50 rounded-2xl mb-4">
                <FaUserCircle className="h-8 w-8 text-sky-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">{isLoginMode ? "Welcome Back" : "Create Account"}</h2>
              <p className="mt-2 text-gray-600 text-lg">
                {isLoginMode ? "Sign in to your account" : "Join our delivery network"}
              </p>
            </div>

            {notification.message && (
              <div
                className={`mb-6 p-4 rounded-xl animate-fade-in flex items-center ${notification.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  }`}
                role="alert"
              >
                {notification.type === "success" ? (
                  <FaCheckCircle className="h-5 w-5 mr-2" />
                ) : (
                  <FaExclamationCircle className="h-5 w-5 mr-2" />
                )}
                <p className="text-sm">{notification.message}</p>
              </div>
            )}

            <form onSubmit={isLoginMode ? handleLogin : handleRegister} className="space-y-5">
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-sky-500 group-hover:text-sky-600 transition-colors" />
                  </div>
                  <input
                    name="username"
                    type="text"
                    required
                    className={`block w-full pl-12 pr-3 py-4 text-gray-700 border ${validationErrors.username ? "border-red-500 bg-red-50" : "border-gray-300"
                      } rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white transition duration-200 text-lg`}
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </div>
                {validationErrors.username && <p className="text-sm text-red-600 mt-1">{validationErrors.username}</p>}

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-sky-500 group-hover:text-sky-600 transition-colors" />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className={`block w-full pl-12 pr-12 py-4 text-gray-700 border ${validationErrors.password ? "border-red-500 bg-red-50" : "border-gray-300"
                      } rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white transition duration-200 text-lg`}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-500 hover:text-sky-500" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-500 hover:text-sky-500" />
                    )}
                  </button>
                </div>
                {validationErrors.password && <p className="text-sm text-red-600 mt-1">{validationErrors.password}</p>}

                {!isLoginMode && (
                  <>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaUserCircle className="h-5 w-5 text-sky-500 group-hover:text-sky-600 transition-colors" />
                      </div>
                      <input
                        name="fullName"
                        type="text"
                        required
                        className={`block w-full pl-12 pr-3 py-4 text-gray-700 border ${validationErrors.fullName ? "border-red-500 bg-red-50" : "border-gray-300"
                          } rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white transition duration-200 text-lg`}
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={handleInputChange}
                      />
                    </div>
                    {validationErrors.fullName && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.fullName}</p>
                    )}

                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaEnvelope className="h-5 w-5 text-sky-500 group-hover:text-sky-600 transition-colors" />
                      </div>
                      <input
                        name="email"
                        type="email"
                        required
                        className={`block w-full pl-12 pr-3 py-4 text-gray-700 border ${validationErrors.email ? "border-red-500 bg-red-50" : "border-gray-300"
                          } rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white transition duration-200 text-lg`}
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    {validationErrors.email && <p className="text-sm text-red-600 mt-1">{validationErrors.email}</p>}

                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaPhone className="h-5 w-5 text-sky-500 group-hover:text-sky-600 transition-colors" />
                      </div>
                      <input
                        name="phone"
                        type="tel"
                        required
                        className={`block w-full pl-12 pr-3 py-4 text-gray-700 border ${validationErrors.phone ? "border-red-500 bg-red-50" : "border-gray-300"
                          } rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white transition duration-200 text-lg`}
                        placeholder="Phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    {validationErrors.phone && <p className="text-sm text-red-600 mt-1">{validationErrors.phone}</p>}

                    <div className="relative group">
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="block w-full pl-4 pr-10 py-4 text-gray-700 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white transition duration-200 appearance-none text-lg"
                      >
                        <option value="Customer">Customer</option>
                        <option value="DeliveryStaff">Delivery Staff</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                        <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {isLoginMode && (
                <div className="flex justify-end">
                  <div className="text-sm">
                    <a href="#" className="font-medium text-sky-600 hover:text-sky-500">
                      Forgot password?
                    </a>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      {isLoginMode ? <FaArrowRight className="h-5 w-5" /> : <FaUserCircle className="h-5 w-5" />}
                    </span>
                  )}
                  {isLoading ? "Processing..." : isLoginMode ? "Sign in" : "Create account"}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <button
                onClick={() => setIsLoginMode(!isLoginMode)}
                className="text-sky-600 hover:text-sky-500 text-base font-medium transition-colors"
              >
                {isLoginMode ? "Need an account? Register" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>

          <p className="text-center text-gray-500 text-xs mt-4">
            By signing in, you agree to our{" "}
            <a href="/terms" className="text-sky-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-sky-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      {/* Add CSS for animations */}
      <style jsx>{`
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

export default Login
