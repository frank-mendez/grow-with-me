import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { GoogleAnalytics } from '@next/third-parties/google'
import {
  Cormorant_Garamond,
  DM_Sans,
  Inter,
  Playfair_Display,
  Nunito,
  Lora,
  DM_Serif_Display,
  Manrope,
} from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
})

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
})

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
})

const dmSerif = DM_Serif_Display({
  variable: '--font-dm-serif',
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
})

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title: 'Grow With Me — Your Pregnancy Journey',
  description:
    'A beautiful week-by-week pregnancy companion. Track kicks, record messages to your baby, and watch your garden of moods bloom.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable} ${inter.variable} ${playfair.variable} ${nunito.variable} ${lora.variable} ${dmSerif.variable} ${manrope.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var v=['botanical','blossom','midnight','light'];var t=localStorage.getItem('gwm-theme');document.documentElement.setAttribute('data-theme',v.indexOf(t)>-1?t:'botanical');}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
      {process.env.NODE_ENV === 'production' && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!} />
      )}
    </html>
  )
}
