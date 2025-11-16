import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t border-[#1a4f54] py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <img src="/images/bidrr-white-logo.png" alt="Bidrr" className="h-8 mb-4" />
            <p className="text-white/70 text-sm">Connect with trusted home service professionals</p>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-start md:justify-end gap-4 md:gap-6">
            <Link href="/terms" className="text-white/70 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-white/70 hover:text-white text-sm transition-colors">
              Privacy
            </Link>
            <Link href="/help" className="text-white/70 hover:text-white text-sm transition-colors">
              Help
            </Link>
          </div>
        </div>
        <div className="border-t border-[#1a4f54] pt-8 text-center text-white/60 text-sm">
          © {new Date().getFullYear()} Bidrr. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
