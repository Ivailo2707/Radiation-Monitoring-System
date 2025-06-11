import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Radiation Monitoring System</h1>
      <div className="flex gap-4">
        <Link 
          href="/signup"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          Sign Up
        </Link>
        <Link
          href="/login"
          className="px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition"
        >
          Log In
        </Link>
      </div>
    </main>
  );
}
