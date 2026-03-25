export const PrintButton = ({ onClick, children = 'Print' }) => (
  <button onClick={onClick} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200">
    🖨️ {children}
  </button>
);