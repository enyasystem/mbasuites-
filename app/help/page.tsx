import Link from "next/link"

export default function HelpPage() {
  const categories = [
    {
      title: "Getting Started",
      icon: "🚀",
      articles: [
        { title: "How to make a booking", slug: "how-to-book" },
        { title: "Creating an account", slug: "create-account" },
        { title: "Navigating the website", slug: "navigation" },
      ],
    },
    {
      title: "Bookings & Reservations",
      icon: "📅",
      articles: [
        { title: "Modifying your booking", slug: "modify-booking" },
        { title: "Cancellation policy", slug: "cancellation" },
        { title: "Booking confirmation", slug: "confirmation" },
      ],
    },
    {
      title: "Payments & Refunds",
      icon: "💳",
      articles: [
        { title: "Payment methods accepted", slug: "payment-methods" },
        { title: "Refund process", slug: "refund-process" },
        { title: "Invoice & receipt", slug: "invoice" },
      ],
    },
    {
      title: "Account & Security",
      icon: "🔒",
      articles: [
        { title: "Password reset", slug: "password-reset" },
        { title: "Two-factor authentication", slug: "2fa" },
        { title: "Privacy policy", slug: "privacy" },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-foreground mb-4">Help Center</h1>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions and get support with your account, bookings, and more.
          </p>

          <div className="mt-8 flex gap-4 justify-center">
            <input
              type="text"
              placeholder="Search help articles..."
              className="flex-1 max-w-md px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
              Search
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {categories.map((category) => (
            <div
              key={category.title}
              className="rounded-xl border border-border bg-card p-8 hover:border-primary/50 transition-all"
            >
              <div className="mb-4 text-4xl">{category.icon}</div>
              <h2 className="text-2xl font-bold text-foreground mb-6">{category.title}</h2>
              <ul className="space-y-3">
                {category.articles.map((article) => (
                  <li key={article.slug}>
                    <Link
                      href={`#`}
                      className="text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-2"
                    >
                      {article.title}
                      <span className="text-xs">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-12 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Still need help?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our support team is available 24/7 to assist you with any questions or concerns.
          </p>
          <button className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  )
}
