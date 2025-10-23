const ProductTableSkeleton = () => {
  return (
    <div className="animate-pulse">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs font-medium text-gray-500 border-b border-gray-200/50 bg-white/50">
            <th className="p-4"><div className="h-3 bg-gray-300/50 rounded w-24"></div></th>
            <th className="p-4"><div className="h-3 bg-gray-300/50 rounded w-16"></div></th>
            <th className="p-4"><div className="h-3 bg-gray-300/50 rounded w-20"></div></th>
            <th className="p-4"><div className="h-3 bg-gray-300/50 rounded w-12"></div></th>
            <th className="p-4"><div className="h-3 bg-gray-300/50 rounded w-16"></div></th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, i) => (
            <tr key={i} className="border-b border-gray-200/30">
              <td className="p-4"><div className="h-4 bg-gray-300/50 rounded w-48"></div></td>
              <td className="p-4"><div className="h-6 bg-gray-300/50 rounded-full w-20"></div></td>
              <td className="p-4"><div className="h-4 bg-gray-300/50 rounded w-24"></div></td>
              <td className="p-4"><div className="h-4 bg-gray-300/50 rounded w-16"></div></td>
              <td className="p-4"><div className="h-4 bg-gray-300/50 rounded w-20"></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTableSkeleton;