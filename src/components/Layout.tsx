import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="dark relative min-h-screen bg-[#000000] text-foreground overflow-hidden selection:bg-[#2dd4bf]/30 selection:text-white">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#000000] via-[#021414] to-[#062d2d] z-0 pointer-events-none" />

      {/* Animated Blurred Orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#7c3aed]/10 blur-[120px] animate-float z-0 pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-[#0d9488]/10 blur-[140px] animate-float-delayed z-0 pointer-events-none" />
      <div className="fixed top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full bg-[#f472b6]/5 blur-[100px] animate-pulse-slow z-0 pointer-events-none" />

      {/* Main Content Container */}
      <main className="relative z-10 flex flex-col min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
