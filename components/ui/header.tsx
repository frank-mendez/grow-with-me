interface HeaderProps {
  eyebrow?: string
  title: string
}

export function Header({ eyebrow, title }: HeaderProps) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <p
          className="text-xs tracking-widest uppercase mb-1"
          style={{ color: 'var(--gold)' }}
        >
          {eyebrow}
        </p>
      )}
      <h1
        className="text-3xl font-light"
        style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--cream)' }}
      >
        {title}
      </h1>
    </div>
  )
}
