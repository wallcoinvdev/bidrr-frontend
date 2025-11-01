import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="bg-[#03353a] py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <Link href="/" className="flex items-center">
            <img src="/images/logo-white.png" alt="Bidrr" className="h-8" />
          </Link>
          <nav className="flex items-center gap-8">
            <Link href="/privacy" className="text-white/70 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-white/70 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/help" className="text-white/70 hover:text-white transition-colors">
              Help
            </Link>
          </nav>
          <div className="text-white/60 text-sm">© 2025 Bidrr. All rights reserved.</div>
        </div>
      </div>
    </footer>
  )
}
