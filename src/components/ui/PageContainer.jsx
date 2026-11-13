const SIZES = {
  sm: "max-w-md",
  md: "max-w-3xl",
  lg: "max-w-shell",
}

export default function PageContainer({ size = "md", className = "", ...props }) {
  return <div className={`mx-auto w-full px-4 py-8 sm:px-6 ${SIZES[size]} ${className}`} {...props} />
}
