const TONES = {
  info: "text-muted",
  success: "text-success",
  danger: "text-danger",
}

export default function StatusText({ tone = "info", className = "", ...props }) {
  return <p className={`text-sm font-medium ${TONES[tone]} ${className}`} {...props} />
}
