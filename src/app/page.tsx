import Navbar from '@/components/Navbar'
import Carousel from '@/components/Carousel'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 60, background: 'var(--gray-950)', minHeight: '100vh' }}>
        <Carousel />
      </main>
    </>
  )
}
