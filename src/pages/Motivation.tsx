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
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Logo } from '@/components/Logo'
import useDiagnosisStore from '@/stores/useDiagnosisStore'

const formSchema = z.object({
  motivacao: z.string().min(5, { message: 'Por favor, detalhe um pouco mais a sua resposta.' }),
})

export default function Motivation() {
  const navigate = useNavigate()
  const { data: storeData, updateData } = useDiagnosisStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      motivacao: storeData.motivacao || '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateData(values)
    navigate('/bloco-a')
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
            <Link to="/instrucoes">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Link>
          </Button>
          <Logo className="text-2xl" />
          <div className="w-[88px]" />
        </div>

        <div className="space-y-2 w-full">
          <div className="flex justify-between text-xs text-slate-400 font-medium px-1">
            <span>Passo 1 de 5: Introdução</span>
            <span>20%</span>
          </div>
          <Progress
            value={20}
            className="h-1.5 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-[#4bb7a5] [&>div]:via-[#957588] [&>div]:to-[#f45961]"
          />
        </div>
      </div>

      <div className="w-full max-w-2xl relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#8b5cf6]/20 to-[#2dd4bf]/20 rounded-3xl blur-xl opacity-50 z-0"></div>

        <div className="relative bg-black/40 border border-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-10 shadow-2xl z-10">
          <div className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-3">
              Antes de começarmos...
            </h2>
            <p className="text-slate-400 text-sm md:text-base font-normal leading-relaxed">
              Queremos entender melhor o seu momento atual para personalizar ainda mais o seu
              diagnóstico.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              <div className="space-y-8">
                <FormField
                  control={form.control}
                  name="motivacao"
                  render={({ field }) => (
                    <FormItem className="space-y-4 bg-white/5 border border-white/10 p-5 rounded-xl">
                      <FormLabel className="text-base text-slate-200 font-medium leading-relaxed">
                        O que te fez tomar a decisão e o que mais te chamou atenção no Adapta Pass?
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
                  type="submit"
                  disabled={!form.formState.isValid}
                  className="w-full bg-[#2dd4bf] hover:bg-[#14b8a6] text-black font-bold h-14 text-lg rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(45,212,191,0.3)] disabled:opacity-50 disabled:hover:shadow-none group"
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
