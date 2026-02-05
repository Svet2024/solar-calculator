'use client'

import { useState, useEffect, useCallback } from 'react'
import Calculator from '@/components/Calculator'

// Testimonials data
const testimonials = [
  {
    name: 'Paulo Rodrigues',
    date: '16 Março 2025',
    initials: 'PR',
    text: 'Equipa fantástica e profissional... recomendo',
  },
  {
    name: 'Fernando Almeida',
    date: '14 Fevereiro 2025',
    initials: 'FA',
    text: 'Trabalho 5 estrelas. Comunicação impecável. Explicações claras. Recomendo e voltarei a chamar...',
  },
  {
    name: 'Mark Hartnell',
    date: '4 Fevereiro 2025',
    initials: 'MH',
    text: 'Yuri and his team are great. Super helpful, clean, tidy and respectful from beginning to end. From planning to installation to support...',
  },
  {
    name: 'Nuno Camisao',
    date: '27 Janeiro 2025',
    initials: 'NC',
    text: 'Serviço de qualidade com profissionalismo, recomendo.',
  },
  {
    name: 'Brian O Connell',
    date: '27 Janeiro 2025',
    initials: 'BO',
    text: 'What an amazing team at SvetSolar. Yury and the team were so helpful from the outset, right through to completion.',
  },
  {
    name: 'Free V',
    date: '27 Janeiro 2025',
    initials: 'FV',
    text: 'This is a very good supplier, perfect solution, the construction workers are very serious and professional, worth recommending.',
  },
]

// FAQ data
const faqItems = [
  {
    question: 'Como funcionam os painéis solares?',
    answer: 'Os painéis solares são compostos por células fotovoltaicas que transformam a energia solar em eletricidade. Este processo é possível graças ao efeito fotovoltaico das células, que são estruturas de silício dopadas, criando corrente elétrica ao serem expostas aos fotões solares. Os painéis convertem energia solar em corrente contínua (DC), que é depois transformada em corrente alternada (AC) por um inversor, tornando-a utilizável em aplicações domésticas e empresariais.',
  },
  {
    question: 'Quais são as vantagens da geração de energia solar?',
    answer: 'Além da redução significativa nos custos de eletricidade, a energia solar é uma fonte limpa e renovável, contribuindo para a diminuição do consumo de energia da rede e, consequentemente, a sua pegada de carbono.',
  },
  {
    question: 'Qual é o benefício e o retorno do investimento em painéis solares?',
    answer: 'A instalação de painéis solares pode reduzir significativamente a sua conta de eletricidade, com poupanças até 90%. O retorno do investimento varia, mas normalmente situa-se entre 3 a 10 anos, considerando a longa vida útil dos painéis, que é superior a 25 anos.',
  },
  {
    question: 'Quantos painéis solares são necessários para a minha casa ou empresa?',
    answer: 'A quantidade de painéis solares necessários depende de vários fatores, como o espaço disponível, o consumo de eletricidade, a orientação dos painéis, a incidência de sombras, e o tipo de inversor.',
  },
  {
    question: 'Por que é importante instalar uma bateria junto com os painéis solares?',
    answer: 'A instalação de uma bateria em sistemas fotovoltaicos tem como principal vantagem a capacidade de armazenar energia solar excedente gerada durante o dia, para utilização em períodos sem sol, como à noite ou em dias nublados. Isso aumenta a eficiência e a independência do seu sistema solar, garantindo que você maximize o uso da energia produzida pelos seus painéis e reduza ainda mais sua dependência da rede elétrica.',
  },
  {
    question: 'É possível vender os excedentes de energia produzida pelos meus painéis solares para a rede?',
    answer: 'Sim, é possível e economicamente vantajoso vender o excedente de energia solar gerada pelo seu sistema fotovoltaico para a rede elétrica. Isso não só contribui para uma maior economia nas contas de energia, mas também apoia a sustentabilidade energética, injetando energia limpa na rede.',
  },
  {
    question: 'Como é feita a manutenção dos painéis solares?',
    answer: 'A manutenção é mínima, geralmente envolvendo limpeza ocasional com água e escova para manter a eficiência máxima dos painéis.',
  },
  {
    question: 'Os painéis solares funcionam em qualquer condição climática?',
    answer: 'Sim, os painéis solares não requerem luz solar direta para funcionar eficientemente. Eles são capazes de gerar energia mesmo em dias nublados, sendo Portugal um local ideal devido à sua alta incidência solar anual.',
  },
]

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1)
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Auto-scroll testimonials (3 per view on desktop)
  const slidesPerView = 3
  const totalSlides = Math.ceil(testimonials.length / slidesPerView)

  const nextTestimonial = useCallback(() => {
    setTestimonialIndex((prev) => (prev + 1) % totalSlides)
  }, [totalSlides])

  const prevTestimonial = useCallback(() => {
    setTestimonialIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
  }, [totalSlides])

  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(nextTestimonial, 5000) // Auto-scroll every 5 seconds
    return () => clearInterval(interval)
  }, [isPaused, nextTestimonial])

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-solar-blue text-center mb-2">
          Calculadora Solar
        </h1>
        <p className="text-gray-600 text-center mb-4">
          Simule o seu sistema fotovoltaico em 2 minutos
        </p>

        {/* Progress Steps - only show on steps 1-3 */}
        {currentStep <= 3 && (
          <div className="flex items-center justify-center mb-8">
            {[
              { num: 1, label: 'Casa' },
              { num: 2, label: 'Contacto' },
              { num: 3, label: 'Proposta' },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    currentStep > s.num ? 'bg-green-500 text-white' :
                    currentStep === s.num ? 'bg-solar-orange text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > s.num ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : s.num}
                  </div>
                  <span className={`text-xs mt-1 ${currentStep >= s.num ? 'text-solar-blue font-medium' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div className={`w-12 h-0.5 mx-2 transition-all ${
                    currentStep > s.num ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        )}

        <Calculator onStepChange={setCurrentStep} />

        {/* Testimonials Section - Slider */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-solar-blue text-center mb-2">
            Testemunhos dos nossos clientes
          </h2>
          <p className="text-gray-500 text-center mb-8">
            Mais de 500 instalações em Portugal
          </p>

          {/* Slider Container */}
          <div
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Navigation Arrows */}
            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-solar-blue hover:bg-solar-orange hover:text-white transition-colors"
              aria-label="Anterior"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-solar-blue hover:bg-solar-orange hover:text-white transition-colors"
              aria-label="Próximo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Slides - 3 per view on desktop, 1 on mobile */}
            <div className="overflow-hidden mx-6 md:mx-12">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${testimonialIndex * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-1/3 flex-shrink-0 px-2">
                    <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-md h-full flex flex-col">
                      {/* Google rating header */}
                      <div className="flex items-center justify-between mb-2 md:mb-3">
                        <div className="flex items-center gap-0.5 md:gap-1">
                          {[1,2,3,4,5].map((star) => (
                            <svg key={star} className="w-3 h-3 md:w-5 md:h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        {/* Google icon */}
                        <svg className="w-4 h-4 md:w-6 md:h-6" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </div>
                      <p className="text-xs md:text-base text-gray-600 mb-3 md:mb-4 flex-grow line-clamp-4 md:line-clamp-none">
                        &ldquo;{testimonial.text}&rdquo;
                      </p>
                      <div className="flex items-center gap-2 md:gap-3 mt-auto">
                        <div className="w-7 h-7 md:w-10 md:h-10 bg-solar-blue rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-xs md:text-sm">{testimonial.initials}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-solar-blue text-xs md:text-base truncate">{testimonial.name}</div>
                          <div className="text-[10px] md:text-xs text-gray-500">{testimonial.date}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dots Navigation */}
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setTestimonialIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === testimonialIndex
                      ? 'bg-solar-orange w-6'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Ir para página ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Trustindex badge */}
          <div className="flex justify-center mt-6">
            <div className="inline-flex items-center gap-2 bg-green-600 text-white text-sm px-4 py-2 rounded-full">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Certificado: Trustindex
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-solar-blue text-center mb-2">
            Perguntas Frequentes <span className="text-solar-orange">(FAQ)</span>
          </h2>
          <p className="text-gray-500 text-center mb-8">
            Tudo o que precisa saber sobre energia solar
          </p>

          <div className="space-y-4 max-w-3xl mx-auto">
            {faqItems.map((item, index) => (
              <details key={index} className="group bg-white rounded-xl shadow-md">
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span className="font-semibold text-solar-blue pr-4">{item.question}</span>
                  <svg className="w-5 h-5 text-solar-orange transition-transform group-open:rotate-180 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-gray-600">
                  <p>{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="mt-16 mb-8">
          <h2 className="text-2xl font-bold text-solar-blue text-center mb-8">
            Contacte-nos
          </h2>

          <div className="bg-white rounded-2xl shadow-md p-8 max-w-2xl mx-auto">
            <p className="font-semibold text-solar-blue mb-6">
              Alguma pergunta? Contacte-nos!
            </p>

            <div className="space-y-4">
              {/* Phone */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-solar-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-solar-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <a href="tel:+351934566607" className="font-semibold text-solar-blue hover:text-solar-orange transition-colors">
                    +351 934 566 607
                  </a>
                  <span className="text-gray-500 text-sm ml-2">- Rede móvel nacional</span>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-solar-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-solar-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <a href="mailto:geral@svetsolar.pt" className="font-semibold text-solar-blue hover:text-solar-orange transition-colors">
                  geral@svetsolar.pt
                </a>
              </div>

              {/* Address - Sede */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-solar-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-solar-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <span className="font-semibold text-solar-blue">Sede</span>
                  <span className="text-gray-600"> - Av. do Atlântico n.º 16, 14.º piso, Escritório 8, 1990-019 Lisboa</span>
                </div>
              </div>

              {/* Address - Armazém */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-solar-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-solar-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <span className="font-semibold text-solar-blue">Armazém adicional com equipa</span>
                  <span className="text-gray-600"> - Caldas da Rainha, Leiria</span>
                </div>
              </div>

              {/* NIF */}
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <span className="text-gray-500">NIF:</span>
                  <span className="font-medium text-gray-700 ml-2">515445860</span>
                </div>
              </div>
            </div>

            {/* Quick contact buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <a
                href="https://wa.me/351924472548?text=Olá! Gostaria de mais informações sobre energia solar."
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
              <a
                href="mailto:geral@svetsolar.pt"
                className="flex-1 flex items-center justify-center gap-2 bg-solar-blue hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Enviar Email
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
