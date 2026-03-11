export default function CreateLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="animate-pulse bg-gray-900 rounded-xl p-5 border border-gray-800">
        <div className="h-6 bg-gray-800 rounded-md w-32 mb-4"></div>
        <div className="h-10 bg-gray-800 rounded-lg w-full mb-3"></div>
        <div className="h-28 bg-gray-800 rounded-lg w-full mb-4"></div>
        <div className="flex gap-2 mb-4">
          <div className="h-6 bg-gray-800 rounded-full w-16"></div>
          <div className="h-6 bg-gray-800 rounded-full w-16"></div>
          <div className="h-6 bg-gray-800 rounded-full w-16"></div>
        </div>
        <div className="h-16 bg-gray-800 rounded-lg w-64 mb-4"></div>
        <div className="h-10 bg-gray-800 rounded-lg w-28"></div>
      </div>
    </div>
  );
}
