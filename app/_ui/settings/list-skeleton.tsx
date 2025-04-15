export default function ListSkeleton() {
  return (
    // Dark mode: Adjust container background
    <div className="w-3/4 mx-auto p-6 my-3 rounded-md bg-slate-50 dark:bg-slate-800">
      <div role="status" className="max-w-sm animate-pulse">
        {/* Placeholder elements already have dark:bg-gray-700 */}
        <div className="h-6 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
