'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const iplBillFormSchema = z.object({
  month: z.number().min(1).max(12, { message: "Bulan harus antara 1-12" }),
  year: z.number().min(2000).max(new Date().getFullYear() + 1, { message: "Tahun tidak valid" }),
  amount: z.string().min(1, { message: "Jumlah IPL harus diisi" }),
  dueDate: z.date({
    required_error: "Tanggal jatuh tempo harus dipilih",
  }),
});

type IPLBillFormValues = z.infer<typeof iplBillFormSchema>;

interface IPLBillFormProps {
  onSubmit: (data: IPLBillFormValues) => void;
  defaultValues?: Partial<IPLBillFormValues>;
  submitLabel?: string;
}

export function IPLBillForm({ onSubmit, defaultValues, submitLabel = "Simpan Tagihan" }: IPLBillFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof iplBillFormSchema>>({
    resolver: zodResolver(iplBillFormSchema),
    defaultValues: {
      month: defaultValues?.month || new Date().getMonth() + 1,
      year: defaultValues?.year || new Date().getFullYear(),
      amount: defaultValues?.amount || '',
      dueDate: defaultValues?.dueDate || new Date(),
    },
  });

  async function handleSubmit(values: IPLBillFormValues) {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      toast.success('Tagihan IPL berhasil disimpan');
    } catch (error) {
      toast.error('Gagal menyimpan tagihan IPL');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="month"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bulan</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(Number(value))} 
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih bulan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Januari</SelectItem>
                    <SelectItem value="2">Februari</SelectItem>
                    <SelectItem value="3">Maret</SelectItem>
                    <SelectItem value="4">April</SelectItem>
                    <SelectItem value="5">Mei</SelectItem>
                    <SelectItem value="6">Juni</SelectItem>
                    <SelectItem value="7">Juli</SelectItem>
                    <SelectItem value="8">Agustus</SelectItem>
                    <SelectItem value="9">September</SelectItem>
                    <SelectItem value="10">Oktober</SelectItem>
                    <SelectItem value="11">November</SelectItem>
                    <SelectItem value="12">Desember</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tahun</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="2024" 
                    {...field} 
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jumlah IPL (Rp)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="0" 
                  {...field}
                  type="number"
                  min="0"
                />
              </FormControl>
              <FormDescription>
                Jumlah iuran per bulan untuk warga
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tanggal Jatuh Tempo</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pilih tanggal</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date() // Disable past dates
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Menyimpan...' : submitLabel}
        </Button>
      </form>
    </Form>
  );
}