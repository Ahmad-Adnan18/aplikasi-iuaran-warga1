'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const announcementFormSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'Judul harus memiliki setidaknya 5 karakter' })
    .max(200, { message: 'Judul tidak boleh lebih dari 200 karakter' }),
  content: z
    .string()
    .min(10, { message: 'Konten harus memiliki setidaknya 10 karakter' })
    .max(10000, { message: 'Konten tidak boleh lebih dari 10000 karakter' }),
});

type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

interface AnnouncementFormProps {
  onSubmit: (data: AnnouncementFormValues) => void;
  defaultValues?: Partial<AnnouncementFormValues>;
  submitLabel?: string;
}

export function AnnouncementForm({ onSubmit, defaultValues, submitLabel = 'Buat Pengumuman' }: AnnouncementFormProps) {
  const form = useForm<z.infer<typeof announcementFormSchema>>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      content: defaultValues?.content || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul Pengumuman</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Jadwal Pemadaman Listrik" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Isi Pengumuman</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tulis isi pengumuman di sini..."
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}