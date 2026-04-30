import Navbar from '@/components/Navbar'
import Carousel from '@/components/Carousel'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main
        style={{
          marginTop: 60,
          height: 'calc(100vh - 60px)',
          background: 'var(--gray-950)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px',
          overflow: 'hidden',
        }}
      >
        <Carousel />
      </main>
    </>
  )
}
