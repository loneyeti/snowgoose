import { login, signup } from "./actions";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <form className="w-full max-w-sm space-y-6 bg-white p-8 rounded-lg shadow-md">
        <img
          src="/snowgoose-logo.png"
          alt="Snowgoose Logo"
          className="mx-auto h-12"
        />
        <h2 className="text-center text-2xl font-semibold text-gray-800 mt-4">
          Welcome Back
        </h2>
        <div className="flex flex-col mt-4">
          <label
            htmlFor="email"
            className="mb-2 text-sm font-medium text-gray-700"
          >
            Email:
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col mt-4">
          <label
            htmlFor="password"
            className="mb-2 text-sm font-medium text-gray-700"
          >
            Password:
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-between items-center mt-6">
          <button
            formAction={login}
            className="w-1/2 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Log in
          </button>
          <button
            formAction={signup}
            className="w-1/2 ml-4 py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
}
