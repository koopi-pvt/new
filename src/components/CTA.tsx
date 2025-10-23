import Link from "next/link";

export function CTA() {
  return (
    <section className="py-20 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-[#f5f5f7]">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-2xl px-6 py-20 sm:px-16 sm:py-24">
          <div className="absolute top-0 right-0 -mt-32 -mr-32 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-32 -ml-32 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>

          <div className="relative text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 sm:mb-8 tracking-tight">
              Ready to start selling?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-10 sm:mb-12">
              Join thousands of entrepreneurs who trust Koopi to power their online stores.
              Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <Link
                href="/signup"
                className="px-8 sm:px-10 py-4 text-base font-semibold text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-all shadow-lg active:scale-95"
              >
                Start for free
              </Link>
              <Link
                href="#features"
                className="px-8 sm:px-10 py-4 text-base font-medium text-gray-700 bg-white/80 rounded-full hover:bg-white transition-all shadow-md border border-gray-200/80 active:scale-95"
              >
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
