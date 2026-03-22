import { useNavigate, Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { ArrowRight, ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/Logo'
import useDiagnosisStore from '@/stores/useDiagnosisStore'

const formSchema = z.object({
  s1: z.string().min(1, { message: 'Selecione uma opção.' }),
  s2: z.string().min(1, { message: 'Selecione uma opção.' }),
  s3: z.string().min(1, { message: 'Selecione uma opção.' }),
  s4: z.string().min(1, { message: 'Selecione uma opção.' }),
  s5: z.string().min(1, { message: 'Selecione uma opção.' }),
  s6: z.string().optional(),
})

const scaleQuestions = [
  {
    id: 's1' as const,
    text: 'S1. Os processos críticos da empresa estão documentados? (1=na cabeça, 5=todos mapeados e acessíveis)',
    minLabel: '1 = na cabeça',
    maxLabel: '5 = todos mapeados e acessíveis',
  },
  {
    id: 's2' as const,
    text: 'S2. Quando alguém novo entra, existe um sistema de onboarding estruturado? (1=cada um se vira, 5=processo completo)',
    minLabel: '1 = cada um se vira',
    maxLabel: '5 = processo completo',
  },
  {
    id: 's3' as const,
    text: 'S3. Se uma pessoa-chave saísse hoje, quanto conhecimento crítico se perderia? (1=tudo, 5=nada, está em sistema)',
    minLabel: '1 = tudo',
    maxLabel: '5 = nada, está em sistema',
  },
  {
    id: 's4' as const,
    text: 'S4. A empresa usa ferramentas integradas (CRM, controles, fluxos) ou planilhas/WhatsApp? (1=só planilha/WhatsApp, 5=sistemas integrados)',
    minLabel: '1 = só planilha/WhatsApp',
    maxLabel: '5 = sistemas integrados',
  },
  {
    id: 's5' as const,
    text: 'S5. Existe uma base de conhecimento interna que o time consulta? (1=não existe, 5=completa e atualizada)',
    minLabel: '1 = não existe',
    maxLabel: '5 = completa e atualizada',
  },
]

export default function BlockS() {
  const navigate = useNavigate()
  const { data: storeData, updateData } = useDiagnosisStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      s1: storeData.s1 || '',
      s2: storeData.s2 || '',
      s3: storeData.s3 || '',
      s4: storeData.s4 || '',
      s5: storeData.s5 || '',
      s6: storeData.s6 || '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateData(values)
    navigate('/bloco-au')
  }

  return (
    <div className="flex-1 flex flex-col items-center py-10 md:py-20 animate-fade-in-up">
      <div className="w-full max-w-2xl mb-8 flex justify-between items-center px-4 md:px-0">
        <Button
          variant="ghost"
          asChild
          className="text-slate-400 hover:text-white hover:bg-white/5 -ml-4"
        >
          <Link to="/bloco-a">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
        <Logo className="text-2xl" />
        <div className="w-[88px]" />
      </div>

      <div className="w-full max-w-2xl relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#2dd4bf]/20 to-[#0d9488]/20 rounded-3xl blur-xl opacity-50 z-0"></div>

        <div className="relative bg-black/40 border border-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-10 shadow-2xl z-10">
          <div className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-3">
              Sessão: <span className="text-[#2dd4bf] font-extrabold">SISTEMATIZAR</span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base font-normal leading-relaxed">
              Nesse bloco avaliamos como está a documentação, onboarding e gestão de conhecimento na
              sua empresa.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              <div className="space-y-8">
                {scaleQuestions.map((q) => (
                  <FormField
                    key={q.id}
                    control={form.control}
                    name={q.id}
                    render={({ field }) => (
                      <FormItem className="space-y-4 bg-white/5 border border-white/10 p-5 rounded-xl">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <FormLabel className="text-base text-slate-200 font-medium leading-relaxed md:max-w-[80%]">
                            {q.text}
                          </FormLabel>
                          <Badge
                            variant="outline"
                            className="w-fit text-xs text-[#2dd4bf] border-[#2dd4bf]/30 bg-[#2dd4bf]/10 shrink-0 uppercase tracking-wide font-semibold"
                          >
                            Sistematizar
                          </Badge>
                        </div>
                        <FormControl>
                          <ToggleGroup
                            type="single"
                            value={field.value}
                            onValueChange={field.onChange}
                            className="justify-between sm:justify-start gap-2 sm:gap-4 pt-2"
                          >
                            {['1', '2', '3', '4', '5'].map((val) => (
                              <ToggleGroupItem
                                key={val}
                                value={val}
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full data-[state=on]:bg-[#2dd4bf] data-[state=on]:text-black text-slate-300 bg-black/40 border border-white/10 hover:bg-white/10 hover:text-white transition-all font-semibold text-lg"
                              >
                                {val}
                              </ToggleGroupItem>
                            ))}
                          </ToggleGroup>
                        </FormControl>
                        <div className="flex justify-between text-xs text-slate-400 pt-1 w-full gap-4">
                          <span className="text-left max-w-[45%] leading-tight">{q.minLabel}</span>
                          <span className="text-right max-w-[45%] leading-tight">{q.maxLabel}</span>
                        </div>
                        <FormMessage className="text-rose-400" />
                      </FormItem>
                    )}
                  />
                ))}

                <FormField
                  control={form.control}
                  name="s6"
                  render={({ field }) => (
                    <FormItem className="space-y-4 bg-white/5 border border-white/10 p-5 rounded-xl">
                      <FormLabel className="text-base text-slate-200 font-medium leading-relaxed">
                        S6. Qual é o processo mais crítico da empresa que ainda mora na cabeça de
                        alguém?
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Sua resposta..."
                          className="bg-black/40 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#2dd4bf] min-h-[120px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-rose-400" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-4">
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  className="w-full sm:w-1/3 border-white/10 text-white hover:bg-white/5 hover:text-white h-14 text-lg rounded-xl"
                >
                  <Link to="/bloco-a">Voltar</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={!form.formState.isValid}
                  className="w-full sm:w-2/3 bg-[#2dd4bf] hover:bg-[#14b8a6] text-black font-bold h-14 text-lg rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(45,212,191,0.3)] disabled:opacity-50 disabled:hover:shadow-none group"
                >
                  Próximo
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
