export default function PostLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-gray-600 text-sm mb-6">← 戻る</div>
      <div className="animate-pulse bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="h-8 bg-gray-800 rounded-lg w-3/4 mb-3"></div>
        <div className="flex gap-2 mb-4">
          <div className="h-5 bg-gray-800 rounded-full w-20"></div>
          <div className="h-5 bg-gray-800 rounded-md w-24"></div>
          <div className="h-5 bg-gray-800 rounded-md w-32"></div>
        </div>
        <div className="flex gap-2 mb-6">
          <div className="h-8 bg-gray-800 rounded-lg w-20"></div>
          <div className="h-8 bg-gray-800 rounded-lg w-20"></div>
          <div className="h-8 bg-gray-800 rounded-lg w-16"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-800 rounded-md w-full"></div>
          <div className="h-4 bg-gray-800 rounded-md w-full"></div>
          <div className="h-4 bg-gray-800 rounded-md w-5/6"></div>
          <div className="h-4 bg-gray-800 rounded-md w-full"></div>
          <div className="h-4 bg-gray-800 rounded-md w-4/6"></div>
          <div className="h-20 bg-gray-800 rounded-lg w-full mt-4"></div>
          <div className="h-4 bg-gray-800 rounded-md w-full"></div>
          <div className="h-4 bg-gray-800 rounded-md w-3/4"></div>
        </div>
      </div>
    </div>
  );
}
