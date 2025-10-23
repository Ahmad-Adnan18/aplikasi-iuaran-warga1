'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
// Define ReportCategory as a literal union type for zod
type ReportCategory = 'kebersihan' | 'keamanan' | 'penerangan' | 'fasilitas' | 'lainnya';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { UploadIcon } from 'lucide-react';

const reportFormSchema = z.object({
  category: z.enum(['kebersihan', 'keamanan', 'penerangan', 'fasilitas', 'lainnya'], {
    errorMap: () => ({ message: 'Silakan pilih kategori laporan' }),
  }),
  description: z
    .string()
    .min(10, { message: 'Deskripsi harus minimal 10 karakter' })
    .max(500, { message: 'Deskripsi tidak boleh lebih dari 500 karakter' }),
  locationDetail: z.string().optional(),
  imageUrl: z.string().optional(),
});

// Define the type based on schema
type ReportFormValues = z.infer<typeof reportFormSchema>;

interface ReportFormProps {
  onSubmit: (data: ReportFormValues) => void;
  submitLabel?: string;
}

export function ReportForm({ onSubmit, submitLabel = 'Kirim Laporan' }: ReportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof reportFormSchema>>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      category: 'lainnya',
      description: '',
      locationDetail: '',
      imageUrl: '',
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        form.setValue('imageUrl', reader.result as string); // This would be an actual URL in production
      };
      
      reader.readAsDataURL(file);
    }
  };

  async function handleSubmit(values: ReportFormValues) {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      toast.success('Laporan berhasil dikirim');
      form.reset();
      setImagePreview(null);
    } catch (error) {
      toast.error('Gagal mengirim laporan');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Laporkan Masalah Fasilitas</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori laporan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="kebersihan">Kebersihan</SelectItem>
                      <SelectItem value="keamanan">Keamanan</SelectItem>
                      <SelectItem value="penerangan">Penerangan</SelectItem>
                      <SelectItem value="fasilitas">Fasilitas</SelectItem>
                      <SelectItem value="lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="locationDetail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lokasi Detail (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Taman Barat, Blok A2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi Masalah</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Jelaskan masalah yang terjadi secara detail..."
                      className="resize-none"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Unggah Foto (Opsional)</FormLabel>
              <div className="mt-2 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-40 object-contain rounded"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute -top-2 -right-2 rounded-full h-6 w-6 p-0"
                      onClick={() => {
                        setImagePreview(null);
                        form.setValue('imageUrl', '');
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer">
                    <UploadIcon className="h-10 w-10 text-gray-400" />
                    <span className="mt-2 text-sm text-gray-600">Klik untuk mengunggah foto</span>
                    <span className="text-xs text-gray-500">JPG, PNG (maks. 5MB)</span>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Mengirim...' : submitLabel}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}