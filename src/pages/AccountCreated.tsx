export default function AccountCreated() {
  return (
    <div className="min-h-screen pt-16 flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-lg p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold mb-4 text-green-600">🎉 Account Created!</h1>
        <p className="text-lg text-gray-700 mb-6">
          Your account has been successfully created. You can now start using NourishSA to connect, donate, and explore.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
        >
          Go to Home
        </a>
      </div>
    </div>
  );
}
