export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Hero skeleton */}
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-800 rounded-lg w-2/3"></div>
        <div className="h-5 bg-gray-800 rounded-md w-1/2"></div>
      </div>
      {/* Post list skeleton */}
      <div className="space-y-4 mt-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-900 rounded-xl p-5 border border-gray-800">
            <div className="h-6 bg-gray-800 rounded-md w-3/4 mb-4"></div>
            <div className="flex gap-2 mb-4">
              <div className="h-5 bg-gray-800 rounded-full w-16"></div>
              <div className="h-5 bg-gray-800 rounded-full w-16"></div>
            </div>
            <div className="h-4 bg-gray-800 rounded-md w-1/2 mb-5"></div>
            <div className="h-8 bg-gray-800 rounded-lg w-24"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
