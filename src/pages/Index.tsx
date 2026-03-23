import { ArrowRight, ClipboardCheck, Users, Rocket, GraduationCap, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { cn } from '@/lib/utils'

const journeySteps = [
  {
    title: 'DMO',
    description: 'Diagnóstico de Maturidade e Oportunidade',
    icon: ClipboardCheck,
    status: 'current',
  },
  {
    title: 'KickOff',
    description: 'Alinhamento com seu Gerente de Negócios',
    icon: Users,
    status: 'locked',
  },
  {
    title: 'Onboarding ao vivo para a Equipe',
    description: 'Realizaremos uma live de onboarding te explicando tudo sobre a plataforma',
    icon: Rocket,
    status: 'locked',
  },
  {
    title: 'Evolução',
    description: 'Início das consultorias, imersões e webinars',
    icon: GraduationCap,
    status: 'locked',
  },
]

const Index = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center max-w-6xl mx-auto py-12 md:py-16 animate-fade-in-up">
      {/* Logo Area */}
      <div className="mb-10">
        <Logo className="text-4xl md:text-5xl" />
      </div>

      {/* Hero Content */}
      <div className="space-y-6 md:space-y-8 w-full mb-14">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mx-auto max-w-4xl">
          Diagnóstico de Maturidade e Oportunidade
        </h1>
      </div>

      {/* Journey Map Section */}
      <div className="w-full mb-16 animate-fade-in-up-delayed" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-sm md:text-base font-semibold text-slate-400 mb-10 text-center uppercase tracking-widest opacity-80">
          Sua Jornada no Adapta Pass
        </h2>

        <div className="relative flex flex-col md:flex-row justify-between w-full px-4 md:px-0">
          {/* Connecting Line */}
          <div className="absolute left-[44px] top-10 bottom-10 w-[2px] bg-slate-800/80 md:left-[12.5%] md:right-[12.5%] md:top-[27px] md:bottom-auto md:h-[2px] md:w-auto z-0" />

          {journeySteps.map((step, index) => (
            <div
              key={index}
              className="relative z-10 flex flex-row md:flex-col items-start md:items-center gap-6 md:gap-5 w-full md:w-1/4 mb-10 md:mb-0 last:mb-0"
            >
              <div
                className={cn(
                  'w-14 h-14 shrink-0 rounded-full flex items-center justify-center border-4 transition-all duration-500 relative bg-[#021414]',
                  step.status === 'current'
                    ? 'border-[#2dd4bf] text-[#2dd4bf] shadow-[0_0_20px_rgba(45,212,191,0.2)] md:scale-110'
                    : 'border-slate-800 text-slate-500',
                )}
              >
                <step.icon className="w-6 h-6" />
                {step.status === 'locked' && (
                  <div className="absolute -bottom-1.5 -right-1.5 bg-[#021414] rounded-full p-1 border-2 border-[#021414]">
                    <Lock className="w-3 h-3 text-slate-400" />
                  </div>
                )}
              </div>

              <div className="text-left md:text-center mt-1 md:mt-0 flex-1">
                <div
                  className={cn(
                    'text-xs font-bold uppercase tracking-wider mb-1.5',
                    step.status === 'current' ? 'text-[#2dd4bf]' : 'text-slate-500',
                  )}
                >
                  Passo {index + 1}
                </div>
                <h3
                  className={cn(
                    'text-base md:text-lg font-bold mb-2 leading-tight',
                    step.status === 'current' ? 'text-white' : 'text-slate-300',
                  )}
                >
                  {step.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed md:max-w-[200px] md:mx-auto">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div
        className="animate-fade-in-up-delayed flex flex-col items-center justify-center w-full gap-5"
        style={{ animationDelay: '0.4s' }}
      >
        <Button
          asChild
          size="lg"
          className="w-full sm:w-auto rounded-full bg-[#2dd4bf] hover:bg-[#14b8a6] text-black font-bold text-lg px-8 py-7 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(45,212,191,0.4)] group"
        >
          <Link to="/diagnostico" className="flex items-center justify-center w-full">
            Preencher e Desbloquear Jornada
            <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default Index
