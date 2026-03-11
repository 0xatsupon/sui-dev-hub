export default function ProfileLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="animate-pulse bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6">
        <div className="flex gap-5 items-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-gray-800 rounded-md w-40"></div>
            <div className="h-4 bg-gray-800 rounded-md w-60"></div>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse bg-gray-900 rounded-xl p-5 border border-gray-800">
            <div className="h-6 bg-gray-800 rounded-md w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-800 rounded-md w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
