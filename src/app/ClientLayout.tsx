map((item) => (
    <Link
      key={item.label}
      href={item.href}
      className={`flex flex-col items-center py-3 px-2 ${
        isActive(item.href)
          ? "text-red-600 dark:text-red-500"
          : "text-gray-700 dark:text-gray-300"
      }`}
    >
      <span className="h-6 w-6">{renderIcon(item.icon)}</span>
      <span className="text-xs mt-1">{item.label}</span>
    </Link>
  ))}
  <button
    onClick={() => setIsSearchOpen(!isSearchOpen)}
    className="flex flex-col items-center py-3 px-2 text-gray-700 dark:text-gray-300"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
    <span className="text-xs mt-1">Search</span>
  </button>
</nav>
</div>
</>
);
}

export default function ClientLayout({
children,
}: Readonly<{
children: React.ReactNode;
}>) {
return (
<div className="flex flex-col min-h-screen">
<SidebarNav />

{/* Main content area with proper padding for sidebar */}
<main className="md:pl-64 flex-1 pt-2 pb-20 md:pb-12">
{children}
</main>

{/* Footer component */}
<footer className="md:pl-64 bg-gray-800 dark:bg-gray-950 text-white py-8">
<div className="container mx-auto px-4">
  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
    <div>
      <h3 className="text-xl font-bold mb-4">About Us</h3>
      <p className="text-gray-300">
        HistoryNet is your destination for exploring historical
        events, wars, famous people, and more through in-depth
        articles and analysis.
      </p>
    </div>
    <div>
      <h3 className="text-xl font-bold mb-4">Categories</h3>
      <ul className="space-y-2">
        <li>
          <Link
            href="/wars-events"
            className="text-gray-300 hover:text-white"
          >
            Wars & Events
          </Link>
        </li>
        <li>
          <Link
            href="/famous-people"
            className="text-gray-300 hover:text-white"
          >
            Famous People
          </Link>
        </li>
        <li>
          <Link
            href="/eras"
            className="text-gray-300 hover:text-white"
          >
            Historical Eras
          </Link>
        </li>
        <li>
          <Link
            href="/topics"
            className="text-gray-300 hover:text-white"
          >
            Special Topics
          </Link>
        </li>
      </ul>
    </div>
    <div>
      <h3 className="text-xl font-bold mb-4">Connect</h3>
      <ul className="space-y-2">
        <li>
          <Link
            href="/newsletters"
            className="text-gray-300 hover:text-white"
          >
            Newsletters
          </Link>
        </li>
        <li>
          <Link
            href="/podcasts"
            className="text-gray-300 hover:text-white"
          >
            Podcasts
          </Link>
        </li>
        <li>
          <Link
            href="/contact"
            className="text-gray-300 hover:text-white"
          >
            Contact Us
          </Link>
        </li>
      </ul>
    </div>
    <div>
      <h3 className="text-xl font-bold mb-4">Subscribe</h3>
      <form className="mt-4">
        <input
          type="email"
          placeholder="Your email address"
          className="px-4 py-2 w-full text-gray-800 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
        />
        <button
          type="submit"
          className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 w-full rounded-md transition"
        >
          Subscribe
        </button>
      </form>
    </div>
  </div>
  <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
    <p>
      © {new Date().getFullYear()} HistoryNet. All Rights
      Reserved.
    </p>
  </div>
</div>
</footer>
</div>
);
}map((item) => (
    <Link
      key={item.label}
      href={item.href}
      className={`flex flex-col items-center py-3 px-2 ${
        isActive(item.href)
          ? "text-red-600 dark:text-red-500"
          : "text-gray-700 dark:text-gray-300"
      }`}
    >
      <span className="h-6 w-6">{renderIcon(item.icon)}</span>
      <span className="text-xs mt-1">{item.label}</span>
    </Link>
  ))}
  <button
    onClick={() => setIsSearchOpen(!isSearchOpen)}
    className="flex flex-col items-center py-3 px-2 text-gray-700 dark:text-gray-300"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
    <span className="text-xs mt-1">Search</span>
  </button>
</nav>
</div>
</>
);
}

export default function ClientLayout({
children,
}: Readonly<{
children: React.ReactNode;
}>) {
return (
<div className="flex flex-col min-h-screen">
<SidebarNav />

{/* Main content area with proper padding for sidebar */}
<main className="md:pl-64 flex-1 pt-2 pb-20 md:pb-12">
{children}
</main>

{/* Footer component */}
<footer className="md:pl-64 bg-gray-800 dark:bg-gray-950 text-white py-8">
<div className="container mx-auto px-4">
  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
    <div>
      <h3 className="text-xl font-bold mb-4">About Us</h3>
      <p className="text-gray-300">
        HistoryNet is your destination for exploring historical
        events, wars, famous people, and more through in-depth
        articles and analysis.
      </p>
    </div>
    <div>
      <h3 className="text-xl font-bold mb-4">Categories</h3>
      <ul className="space-y-2">
        <li>
          <Link
            href="/wars-events"
            className="text-gray-300 hover:text-white"
          >
            Wars & Events
          </Link>
        </li>
        <li>
          <Link
            href="/famous-people"
            className="text-gray-300 hover:text-white"
          >
            Famous People
          </Link>
        </li>
        <li>
          <Link
            href="/eras"
            className="text-gray-300 hover:text-white"
          >
            Historical Eras
          </Link>
        </li>
        <li>
          <Link
            href="/topics"
            className="text-gray-300 hover:text-white"
          >
            Special Topics
          </Link>
        </li>
      </ul>
    </div>
    <div>
      <h3 className="text-xl font-bold mb-4">Connect</h3>
      <ul className="space-y-2">
        <li>
          <Link
            href="/newsletters"
            className="text-gray-300 hover:text-white"
          >
            Newsletters
          </Link>
        </li>
        <li>
          <Link
            href="/podcasts"
            className="text-gray-300 hover:text-white"
          >
            Podcasts
          </Link>
        </li>
        <li>
          <Link
            href="/contact"
            className="text-gray-300 hover:text-white"
          >
            Contact Us
          </Link>
        </li>
      </ul>
    </div>
    <div>
      <h3 className="text-xl font-bold mb-4">Subscribe</h3>
      <form className="mt-4">
        <input
          type="email"
          placeholder="Your email address"
          className="px-4 py-2 w-full text-gray-800 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
        />
        <button
          type="submit"
          className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 w-full rounded-md transition"
        >
          Subscribe
        </button>
      </form>
    </div>
  </div>
  <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
    <p>
      © {new Date().getFullYear()} HistoryNet. All Rights
      Reserved.
    </p>
  </div>
</div>
</footer>
</div>
);
}