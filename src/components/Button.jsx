export const Button = ({ children, variant = 'primary', onClick, className = '', ...props }) => {
  const variants = {
    primary: 'bg-primary text-white hover:bg-blue-700',
    secondary: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
    danger: 'bg-danger text-white hover:bg-red-700',
  };
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full transition ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};