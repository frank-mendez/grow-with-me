interface ContainerProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function Container({ children, className = '', style }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-xl px-4 ${className}`} style={style}>
      {children}
    </div>
  )
}
