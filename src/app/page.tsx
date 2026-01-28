import Calculator from '@/components/Calculator'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-solar-blue text-center mb-2">
          Calculadora Solar
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Simule o seu sistema fotovoltaico em 2 minutos
        </p>
        <Calculator />
      </div>
    </main>
  )
}
