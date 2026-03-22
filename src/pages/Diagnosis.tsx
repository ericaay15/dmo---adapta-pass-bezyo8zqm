import { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Logo } from '@/components/Logo'
import useDiagnosisStore from '@/stores/useDiagnosisStore'

const formSchema = z.object({
  cnpj: z.string().length(18, { message: 'O CNPJ deve estar completo (14 dígitos).' }),
  adminEmail: z.string().email({ message: 'Insira um e-mail válido.' }),
  userName: z.string().min(2, { message: 'O nome é obrigatório.' }),
  leadName: z.string().min(2, { message: 'O nome do responsável é obrigatório.' }),
  leadEmail: z.string().email({ message: 'Insira um e-mail válido.' }),
})

export const formatCnpj = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1')
}

export default function Diagnosis() {
  const navigate = useNavigate()
  const { data: storeData, updateData } = useDiagnosisStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange', // Validate on change to enable/disable button dynamically
    defaultValues: {
      cnpj: storeData.cnpj || '',
      adminEmail: storeData.adminEmail || '',
      userName: storeData.userName || '',
      leadName: storeData.leadName || '',
      leadEmail: storeData.leadEmail || '',
    },
  })

  const isFormValid = form.formState.isValid

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Store data in local state
    updateData(values)
    // Redirect to the next block
    navigate('/bloco-a')
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
        <div className="w-[88px]" /> {/* Spacer to center logo properly */}
      </div>

      <div className="w-full max-w-2xl relative">
        {/* Card Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#2dd4bf]/20 to-[#f472b6]/20 rounded-3xl blur-xl opacity-50 z-0"></div>

        {/* Form Container */}
        <div className="relative bg-black/40 border border-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-10 shadow-2xl z-10">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-sm font-semibold text-[#2dd4bf] uppercase tracking-wider mb-2">
              Informações Iniciais
            </h2>
            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Dados da Empresa
            </h3>
            <p className="text-slate-400 mt-2 text-sm md:text-base">
              Preencha os dados abaixo para darmos início ao Diagnóstico.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">CNPJ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="00.000.000/0000-00"
                          {...field}
                          onChange={(e) => field.onChange(formatCnpj(e.target.value))}
                          maxLength={18}
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#2dd4bf] h-12"
                        />
                      </FormControl>
                      <FormMessage className="text-rose-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adminEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">E-mail do Admin</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="admin@empresa.com.br"
                          {...field}
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#2dd4bf] h-12"
                        />
                      </FormControl>
                      <FormMessage className="text-rose-400" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Nome de quem está preenchendo</FormLabel>
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

              <div className="bg-white/5 border border-white/10 rounded-xl p-6 mt-8 space-y-6">
                <div className="mb-4">
                  <h4 className="text-lg font-medium text-white">
                    Responsável pela Implementação de IA
                  </h4>
                  <p className="text-sm text-slate-400">
                    Quem liderará esta iniciativa na empresa?
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="leadName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Nome do Responsável</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome completo"
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
                    name="leadEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">E-mail do Responsável</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="lider@empresa.com.br"
                            {...field}
                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#2dd4bf] h-12"
                          />
                        </FormControl>
                        <FormMessage className="text-rose-400" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={!isFormValid}
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
