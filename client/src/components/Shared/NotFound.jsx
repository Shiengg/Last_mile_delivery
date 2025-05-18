"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Package, ArrowLeft, Home, MapPin, Truck, PackageOpen } from "lucide-react"
import Header from "../../components/Shared/Header"

const NotFound = () => {
  const navigate = useNavigate()
  const [isHovering, setIsHovering] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [showPackage, setShowPackage] = useState(true)
  const [showTruck, setShowTruck] = useState(false)
  const [truckPosition, setTruckPosition] = useState(-100)
  const [hasInteracted, setHasInteracted] = useState(false)

  const handleGoBack = () => {
    navigate(-1) // Go back to previous page
  }

  const handleGoHome = () => {
    navigate("/") // Go to home page
  }

  // Handle mouse move for parallax effect
  const handleMouseMove = (e) => {
    if (!hasInteracted) {
      const { clientX, clientY } = e
      const moveX = (clientX - window.innerWidth / 2) / 50
      const moveY = (clientY - window.innerHeight / 2) / 50
      setPosition({ x: moveX, y: moveY })
    }
  }

  // Handle package click animation
  const handlePackageClick = () => {
    setHasInteracted(true)
    setShowPackage(false)
    setTimeout(() => {
      setShowTruck(true)
      const truckAnimation = setInterval(() => {
        setTruckPosition((prev) => {
          if (prev > window.innerWidth) {
            clearInterval(truckAnimation)
            setTimeout(() => {
              setShowPackage(true)
              setShowTruck(false)
              setTruckPosition(-100)
              setHasInteracted(false)
            }, 1000)
            return -100
          }
          return prev + 10
        })
      }, 20)
    }, 500)
  }

  // Random position for floating elements
  const randomPosition = () => {
    return {
      x: Math.random() * 60 - 30,
      y: Math.random() * 60 - 30,
      scale: Math.random() * 0.5 + 0.5,
      rotate: Math.random() * 360,
    }
  }

  // Generate floating elements
  const floatingElements = Array.from({ length: 15 }).map((_, i) => {
    const pos = randomPosition()
    return (
      <motion.div
        key={i}
        className="absolute opacity-20"
        initial={{ ...pos }}
        animate={{
          y: [pos.y, pos.y - 20, pos.y],
          rotate: [pos.rotate, pos.rotate + 10, pos.rotate],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 3 + Math.random() * 2,
          ease: "easeInOut",
          repeatType: "reverse",
        }}
        style={{
          left: `${50 + pos.x}%`,
          top: `${50 + pos.y}%`,
          transform: `scale(${pos.scale})`,
        }}
      >
        {i % 3 === 0 ? (
          <Package className="w-8 h-8 text-teal-600" />
        ) : i % 3 === 1 ? (
          <MapPin className="w-6 h-6 text-rose-500" />
        ) : (
          <PackageOpen className="w-7 h-7 text-amber-500" />
        )}
      </motion.div>
    )
  })

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <Header title="404 Not Found" />

      {/* Background elements */}
      <div className="fixed inset-0 z-0 opacity-50">{floatingElements}</div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
        <div className="max-w-xl mx-auto text-center">
          {/* Interactive 404 Illustration */}
          <div className="mb-12 relative h-64">
            <AnimatePresence>
              {showPackage && (
                <motion.div
                  className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    x: position.x * 2,
                    y: position.y * 2,
                  }}
                  exit={{ scale: 1.5, opacity: 0, y: 50 }}
                  whileHover={{ scale: 1.1 }}
                  onClick={handlePackageClick}
                >
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                    <div className="relative bg-white p-6 rounded-xl shadow-xl">
                      <div className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">
                        404
                      </div>
                      <div className="mt-2 text-slate-500 text-sm">Click me!</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showTruck && (
                <motion.div
                  className="absolute top-1/2 transform -translate-y-1/2"
                  style={{ left: `${truckPosition}px` }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="relative">
                    <Truck className="h-20 w-20 text-teal-600" />
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0"
                      animate={{ y: [0, -2, 0] }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.3 }}
                    >
                      <div className="h-3 w-3 rounded-full bg-slate-800 absolute left-4 bottom-0"></div>
                      <div className="h-3 w-3 rounded-full bg-slate-800 absolute right-4 bottom-0"></div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Error Message */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Oops! This order is lost</h2>
            <p className="text-lg text-slate-600">
              The page you are looking for does not exist or has been moved to a different location.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              onClick={handleGoBack}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-md hover:shadow-lg transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="mr-2 -ml-1 h-5 w-5" />
              Go back
            </motion.button>

            <motion.button
              onClick={handleGoHome}
              className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 text-base font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-md hover:shadow-lg transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home className="mr-2 -ml-1 h-5 w-5" />
              Go home
            </motion.button>
          </motion.div>

          {/* Map with Lost Package */}
          <motion.div
            className="mt-16 relative h-48 sm:h-64 mx-auto max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="absolute inset-0 bg-slate-200 rounded-xl overflow-hidden">
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Map grid lines */}
                {Array.from({ length: 10 }).map((_, i) => (
                  <line key={`h-${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="#CBD5E1" strokeWidth="0.2" />
                ))}
                {Array.from({ length: 10 }).map((_, i) => (
                  <line key={`v-${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="#CBD5E1" strokeWidth="0.2" />
                ))}

                {/* Map roads */}
                <path d="M0,20 L100,20" stroke="#94A3B8" strokeWidth="1" />
                <path d="M0,50 L100,50" stroke="#94A3B8" strokeWidth="1" />
                <path d="M0,80 L100,80" stroke="#94A3B8" strokeWidth="1" />
                <path d="M30,0 L30,100" stroke="#94A3B8" strokeWidth="1" />
                <path d="M70,0 L70,100" stroke="#94A3B8" strokeWidth="1" />
              </svg>

              {/* Animated lost package */}
              <motion.div
                className="absolute"
                initial={{ x: "30%", y: "30%" }}
                animate={{
                  x: ["30%", "70%", "70%", "30%", "30%"],
                  y: ["30%", "30%", "70%", "70%", "30%"],
                }}
                transition={{
                  duration: 15,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <div className="relative">
                    <div className="absolute -inset-1 bg-teal-500 rounded-full blur-md opacity-50"></div>
                    <div className="relative bg-white p-1 rounded-full">
                      <Package className="h-6 w-6 text-teal-600" />
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Start point */}
              <div className="absolute left-[30%] top-[30%] w-3 h-3 rounded-full bg-emerald-500"></div>

              {/* End point */}
              <div className="absolute right-[30%] bottom-[30%] w-3 h-3 rounded-full bg-rose-500"></div>

              {/* Question marks */}
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute text-rose-500 font-bold"
                  style={{
                    left: `${30 + i * 15}%`,
                    top: `${30 + i * 15}%`,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.5,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                >
                  ?
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-4">Liên hệ với chúng tôi</h3>
            <div className="flex flex-wrap justify-center gap-6">
              <motion.a
                href="https://facebook.com/your-profile"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 hover:text-teal-700 text-sm flex items-center"
                whileHover={{ scale: 1.1 }}
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
                Facebook
              </motion.a>

              <motion.a
                href="https://github.com/your-username"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 hover:text-teal-700 text-sm flex items-center"
                whileHover={{ scale: 1.1 }}
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Github
              </motion.a>

              <motion.a
                href="mailto:your.email@example.com"
                className="text-teal-600 hover:text-teal-700 text-sm flex items-center"
                whileHover={{ scale: 1.1 }}
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Email
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
