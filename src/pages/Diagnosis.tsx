import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Loader2, ArrowLeft } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Logo } from '@/components/Logo'
import { Link } from 'react-router-dom'

const formSchema = z.object({
  nome: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  email: z.string().email({ message: 'Insira um e-mail corporativo válido.' }),
  empresa: z.string().min(2, { message: 'O nome da empresa é obrigatório.' }),
  cargo: z.string({ required_error: 'Selecione o seu cargo.' }),
  tamanhoEquipe: z.string({ required_error: 'Selecione o tamanho da equipe.' }),
})

export default function Diagnosis() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      email: '',
      empresa: '',
      cargo: '',
      tamanhoEquipe: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success('Diagnóstico enviado com sucesso!', {
        description: 'Nossa equipe entrará em contato em breve com o seu plano personalizado.',
      })
      navigate('/')
    }, 2000)
  }

  return (
    <div className="flex-1 flex flex-col items-center py-10 md:py-20 animate-fade-in-up">
      <div className="w-full max-w-2xl mb-8 flex justify-between items-center px-4 md:px-0">
        <Button
          variant="ghost"
          asChild
          className="text-slate-400 hover:text-white hover:bg-white/5 -ml-4"
        >
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
        <Logo className="text-2xl" />
        <div className="w-[88px]" /> {/* Spacer to center logo properly against the back button */}
      </div>

      <div className="w-full max-w-2xl relative">
        {/* Card Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#2dd4bf]/20 to-[#f472b6]/20 rounded-3xl blur-xl opacity-50 z-0"></div>

        {/* Form Container */}
        <div className="relative bg-black/40 border border-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-10 shadow-2xl z-10">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-sm font-semibold text-[#2dd4bf] uppercase tracking-wider mb-2">
              Passo 1 de 1: Informações Iniciais
            </h2>
            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Diagnóstico de Maturidade Organizacional
            </h3>
            <p className="text-slate-400 mt-2 text-sm md:text-base">
              Preencha os dados abaixo para que possamos entender o momento da sua empresa.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Nome Completo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: João Silva"
                        {...field}
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#2dd4bf] h-12"
                      />
                    </FormControl>
                    <FormMessage className="text-rose-400" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">E-mail Corporativo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="joao@suaempresa.com.br"
                          {...field}
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#2dd4bf] h-12"
                        />
                      </FormControl>
                      <FormMessage className="text-rose-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="empresa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Nome da Empresa</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="AdaptaTech Ltda."
                          {...field}
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#2dd4bf] h-12"
                        />
                      </FormControl>
                      <FormMessage className="text-rose-400" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="cargo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Cargo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-[#2dd4bf] h-12">
                            <SelectValue placeholder="Selecione o seu cargo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                          <SelectItem value="ceo">CEO / Fundador</SelectItem>
                          <SelectItem value="diretor">Diretor / C-Level</SelectItem>
                          <SelectItem value="gerente">Gerente / Coordenador</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-rose-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tamanhoEquipe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Tamanho da Equipe</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-[#2dd4bf] h-12">
                            <SelectValue placeholder="Selecione o tamanho" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                          <SelectItem value="1-10">1 a 10 pessoas</SelectItem>
                          <SelectItem value="11-50">11 a 50 pessoas</SelectItem>
                          <SelectItem value="51-200">51 a 200 pessoas</SelectItem>
                          <SelectItem value="200+">Mais de 200 pessoas</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-rose-400" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#2dd4bf] hover:bg-[#14b8a6] text-black font-bold h-14 text-lg rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(45,212,191,0.3)]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Enviar Diagnóstico'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
