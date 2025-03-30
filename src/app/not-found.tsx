import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container mx-auto py-20 text-center">
      <h1 className="text-5xl font-bold mb-6">404 - Page Not Found</h1>
      <p className="text-xl mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
      >
        Return to Homepage
      </Link>
    </div>
  );
}
