'use client'
import { themes } from '@/lib/themes'
import { useTheme } from '@/components/theme/ThemeProvider'

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const active = themes.find((t) => t.id === theme)

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--card-border)',
        borderRadius: 14,
        padding: 16,
      }}
    >
      <p
        style={{
          fontSize: 10,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          marginBottom: 4,
        }}
      >
        Appearance
      </p>
      <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>
        Choose a visual atmosphere for your journey
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {themes.map((t) => {
          const isActive = theme === t.id
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={isActive}
              aria-label={`Select ${t.name} theme`}
              onClick={() => setTheme(t.id)}
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                border: isActive
                  ? `2px solid ${t.accent}`
                  : '1px solid rgba(128, 128, 128, 0.15)',
                cursor: 'pointer',
                padding: 0,
                background: 'transparent',
                position: 'relative',
                textAlign: 'left',
              }}
            >
              {/* Preview area */}
              <div style={{ background: t.bg, padding: '10px 10px 6px' }}>
                <div
                  style={{
                    height: 5,
                    background: t.accent,
                    opacity: 0.3,
                    borderRadius: 3,
                    marginBottom: 4,
                    width: '55%',
                  }}
                />
                <div
                  style={{
                    height: 9,
                    background: t.text,
                    opacity: 0.75,
                    borderRadius: 3,
                    marginBottom: 3,
                  }}
                />
                <div
                  style={{
                    height: 4,
                    background: t.text,
                    opacity: 0.25,
                    borderRadius: 3,
                    width: '75%',
                    marginBottom: 6,
                  }}
                />
                <div
                  style={{
                    height: 6,
                    background: t.accent,
                    borderRadius: 4,
                    width: '50%',
                  }}
                />
              </div>

              {/* Name label */}
              <div
                style={{
                  background: t.bg,
                  padding: '5px 10px 8px',
                  borderTop: `1px solid ${t.borderColor}`,
                }}
              >
                <p style={{ fontSize: 9, color: t.accent, margin: 0 }}>{t.name}</p>
              </div>

              {/* Active checkmark badge */}
              {isActive && (
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: 7,
                    right: 7,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: t.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ color: t.bg, fontSize: 9, fontWeight: 700, lineHeight: 1 }}>
                    ✓
                  </span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {active && (
        <p
          style={{
            fontSize: 9,
            color: 'var(--text-dim)',
            marginTop: 10,
            textAlign: 'center',
            letterSpacing: '0.05em',
          }}
        >
          {active.name} is active
        </p>
      )}
    </div>
  )
}
