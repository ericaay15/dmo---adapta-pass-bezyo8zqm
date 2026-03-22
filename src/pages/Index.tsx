import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'

const Index = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center max-w-5xl mx-auto py-12 md:py-24 animate-fade-in-up">
      {/* Logo Area */}
      <div className="mb-12 md:mb-16">
        <Logo className="text-4xl md:text-5xl" />
      </div>

      {/* Hero Content */}
      <div className="space-y-8 md:space-y-10 w-full">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mx-auto max-w-4xl">
          Para empresários que entenderam o mapa. <br className="hidden md:block" />
          <span className="text-[#2dd4bf] drop-shadow-[0_0_15px_rgba(45,212,191,0.3)]">
            E agora querem o guia.
          </span>
        </h1>

        <p className="text-lg md:text-xl lg:text-2xl text-slate-300 leading-relaxed max-w-4xl mx-auto font-medium">
          Um gerente dedicado faz o diagnóstico da sua empresa, treina sua equipe, entrega as
          ferramentas e acompanha os resultados trimestre a trimestre.{' '}
          <br className="hidden lg:block" />
          <span className="text-[#2dd4bf] font-semibold mt-2 inline-block">
            Adapta Pass é implementação de IA com quem já fez isso milhares de vezes.
          </span>
        </p>

        <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto animate-fade-in-up-delayed">
          O primeiro passo para o sucesso é preencher nosso Diagnóstico de Maturidade Organizacional
          para receber um plano personalizado.
        </p>

        {/* Call to Action */}
        <div className="pt-8 animate-fade-in-up-delayed flex justify-center w-full">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto rounded-full bg-[#2dd4bf] hover:bg-[#14b8a6] text-black font-bold text-lg px-8 py-7 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(45,212,191,0.4)] group"
          >
            <Link to="/diagnostico" className="flex items-center justify-center w-full">
              Preencher Agora
              <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Index
