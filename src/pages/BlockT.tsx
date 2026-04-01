import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { ArrowLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

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
import { Progress } from '@/components/ui/progress'
import { Logo } from '@/components/Logo'
import useDiagnosisStore from '@/stores/useDiagnosisStore'
import { submitDiagnosis } from '@/services/diagnostics'

const formSchema = z.object({
  t1: z.number().min(1).max(10),
  t2: z.number().min(1).max(10),
  t3: z.number().min(1).max(10),
  t4: z.string().min(3, { message: 'Por favor, detalhe um pouco mais a sua resposta.' }),
})

export default function BlockT() {
  const navigate = useNavigate()
  const { data: storeData, updateData } = useDiagnosisStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      t1: storeData.t1 || 5,
      t2: storeData.t2 || 5,
      t3: storeData.t3 || 5,
      t4: storeData.t4 || '',
    },
  })

  const hasCompletedPreviousBlocks = () => {
    return Boolean(
      storeData.cnpj &&
      storeData.adminEmail &&
      storeData.userName &&
      storeData.leadName &&
      storeData.leadEmail &&
      storeData.a1 &&
      storeData.a2 &&
      storeData.a3 &&
      storeData.a4 &&
      storeData.a5 &&
      storeData.s1 &&
      storeData.s2 &&
      storeData.s3 &&
      storeData.s4 &&
      storeData.s5 &&
      storeData.au1 &&
      storeData.au2 &&
      storeData.au3 &&
      storeData.au4 &&
      storeData.au5,
    )
  }

  const isPreviousValid = hasCompletedPreviousBlocks()
  const isFormValid = form.formState.isValid
  const canSubmit = isPreviousValid && isFormValid

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateData(values)
    navigate('/segmento')
  }

  return (
    <div className="flex-1 flex flex-col items-center py-10 md:py-20 animate-fade-in-up">
      <div className="w-full max-w-2xl mb-8 flex flex-col gap-6 px-4 md:px-0">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            asChild
            className="text-slate-400 hover:text-white hover:bg-white/5 -ml-4"
          >
            <Link to="/bloco-au">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Link>
          </Button>
          <Logo className="text-2xl" />
          <div className="w-[88px]" />
        </div>

        <div className="space-y-2 w-full">
          <div className="flex justify-between text-xs text-slate-400 font-medium px-1">
            <span>Passo 5 de 5: Transformar</span>
            <span>100%</span>
          </div>
          <Progress
            value={100}
            className="h-1.5 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-[#4bb7a5] [&>div]:via-[#957588] [&>div]:to-[#f45961]"
          />
        </div>
      </div>

      <div className="w-full max-w-2xl relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-black via-[#0d9488]/30 to-[#2dd4bf]/40 rounded-3xl blur-xl opacity-50 z-0"></div>

        <div className="relative bg-black/40 border border-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-10 shadow-2xl z-10">
          <div className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-3">
              Sessão:{' '}
              <span className="bg-gradient-to-r from-[#4bb7a5] via-[#957588] to-[#f45961] bg-clip-text text-transparent font-extrabold">
                TRANSFORMAR
              </span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base font-normal leading-relaxed">
              Nesse bloco final, queremos entender a sua visão e o momento atual de gestão da
              empresa.
            </p>
          </div>

          {!isPreviousValid && (
            <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
              <p className="text-sm text-rose-200 leading-relaxed">
                Atenção: Você possui perguntas obrigatórias pendentes nos blocos anteriores. Por
                favor, retorne e preencha todos os campos para habilitar a geração do plano.
              </p>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              <div className="space-y-8">
                <FormField
                  control={form.control}
                  name="t1"
                  render={({ field }) => (
                    <FormItem className="space-y-4 bg-white/5 border border-white/10 p-5 rounded-xl">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <FormLabel className="text-base text-slate-200 font-medium leading-relaxed md:max-w-[80%]">
                          T1. Numa escala de 1-10, o quanto a empresa funciona sem você (dono) no
                          operacional diário?
                        </FormLabel>
                        <Badge
                          variant="outline"
                          className="w-fit text-xs text-[#2dd4bf] border-[#2dd4bf]/30 bg-[#2dd4bf]/10 shrink-0 uppercase tracking-wide font-semibold"
                        >
                          Nota: {field.value}
                        </Badge>
                      </div>
                      <FormControl>
                        <ToggleGroup
                          type="single"
                          value={field.value ? String(field.value) : ''}
                          onValueChange={(val) => {
                            if (val) field.onChange(Number(val))
                          }}
                          className="flex flex-wrap justify-start gap-2 sm:gap-3 pt-2"
                        >
                          {Array.from({ length: 10 }, (_, i) => String(i + 1)).map((val) => (
                            <ToggleGroupItem
                              key={val}
                              value={val}
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full data-[state=on]:bg-[#2dd4bf] data-[state=on]:text-black text-slate-300 bg-black/40 border border-white/10 hover:bg-white/10 hover:text-white transition-all font-semibold text-sm sm:text-base"
                            >
                              {val}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </FormControl>
                      <div className="flex justify-between text-xs text-slate-400 pt-1 w-full gap-4 font-medium">
                        <span className="text-left leading-tight">1 = Muito dependente</span>
                        <span className="text-right leading-tight">
                          10 = Totalmente independente
                        </span>
                      </div>
                      <FormMessage className="text-rose-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="t2"
                  render={({ field }) => (
                    <FormItem className="space-y-4 bg-white/5 border border-white/10 p-5 rounded-xl">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <FormLabel className="text-base text-slate-200 font-medium leading-relaxed md:max-w-[80%]">
                          T2. Numa escala de 1-10, quanto controle você tem sobre os números do
                          negócio em tempo real?
                        </FormLabel>
                        <Badge
                          variant="outline"
                          className="w-fit text-xs text-[#2dd4bf] border-[#2dd4bf]/30 bg-[#2dd4bf]/10 shrink-0 uppercase tracking-wide font-semibold"
                        >
                          Nota: {field.value}
                        </Badge>
                      </div>
                      <FormControl>
                        <ToggleGroup
                          type="single"
                          value={field.value ? String(field.value) : ''}
                          onValueChange={(val) => {
                            if (val) field.onChange(Number(val))
                          }}
                          className="flex flex-wrap justify-start gap-2 sm:gap-3 pt-2"
                        >
                          {Array.from({ length: 10 }, (_, i) => String(i + 1)).map((val) => (
                            <ToggleGroupItem
                              key={val}
                              value={val}
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full data-[state=on]:bg-[#2dd4bf] data-[state=on]:text-black text-slate-300 bg-black/40 border border-white/10 hover:bg-white/10 hover:text-white transition-all font-semibold text-sm sm:text-base"
                            >
                              {val}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </FormControl>
                      <div className="flex justify-between text-xs text-slate-400 pt-1 w-full gap-4 font-medium">
                        <span className="text-left leading-tight">1 = Nenhum controle</span>
                        <span className="text-right leading-tight">10 = Controle total</span>
                      </div>
                      <FormMessage className="text-rose-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="t3"
                  render={({ field }) => (
                    <FormItem className="space-y-4 bg-white/5 border border-white/10 p-5 rounded-xl">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <FormLabel className="text-base text-slate-200 font-medium leading-relaxed md:max-w-[80%]">
                          T3. Numa escala de 1-10, o quanto você sente que a empresa está preparada
                          pro futuro com IA?
                        </FormLabel>
                        <Badge
                          variant="outline"
                          className="w-fit text-xs text-[#2dd4bf] border-[#2dd4bf]/30 bg-[#2dd4bf]/10 shrink-0 uppercase tracking-wide font-semibold"
                        >
                          Nota: {field.value}
                        </Badge>
                      </div>
                      <FormControl>
                        <ToggleGroup
                          type="single"
                          value={field.value ? String(field.value) : ''}
                          onValueChange={(val) => {
                            if (val) field.onChange(Number(val))
                          }}
                          className="flex flex-wrap justify-start gap-2 sm:gap-3 pt-2"
                        >
                          {Array.from({ length: 10 }, (_, i) => String(i + 1)).map((val) => (
                            <ToggleGroupItem
                              key={val}
                              value={val}
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full data-[state=on]:bg-[#2dd4bf] data-[state=on]:text-black text-slate-300 bg-black/40 border border-white/10 hover:bg-white/10 hover:text-white transition-all font-semibold text-sm sm:text-base"
                            >
                              {val}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </FormControl>
                      <div className="flex justify-between text-xs text-slate-400 pt-1 w-full gap-4 font-medium">
                        <span className="text-left leading-tight">1 = Nada preparada</span>
                        <span className="text-right leading-tight">10 = Muito preparada</span>
                      </div>
                      <FormMessage className="text-rose-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="t4"
                  render={({ field }) => (
                    <FormItem className="space-y-4 bg-white/5 border border-white/10 p-5 rounded-xl">
                      <FormLabel className="text-base text-slate-200 font-medium leading-relaxed">
                        T4. Se você pudesse resolver UM problema do seu negócio nos próximos 90
                        dias, qual seria?
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva o problema aqui..."
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
                  <Link to="/bloco-au">Voltar</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={!canSubmit}
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
