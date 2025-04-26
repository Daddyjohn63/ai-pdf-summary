'use client';

import { useUploadThing } from '@/utils/uploadthing';
import UploadFormInput from './upload-form-input';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  generatePdfSummary,
  storePdfSummaryAction
} from '@/actions/upload-actions';
import { useState } from 'react';
import { useRef } from 'react';
import LoadingSkeleton from './loading-skeleton';

//zod schema
const schema = z.object({
  file: z
    .instanceof(File, { message: 'Invalid file' })
    .refine(
      file => file.size <= 20 * 1024 * 1024,
      'File size must be less than 20MB'
    )
    .refine(
      file => file.type.startsWith('application/pdf'),
      'File must be a PDf'
    )
});

export const UploadForm = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  //uploadthing
  const { startUpload, routeConfig } = useUploadThing('pdfUploader', {
    onClientUploadComplete: () => {
      console.log('uploaded successfully!');
    },
    onUploadError: err => {
      console.error('error occurred while uploading', err);
      toast('Error occurred while uploading', {
        description: err.message
      });
    },
    onUploadBegin: data => {
      console.log('upload has begun for', data);
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const file = formData.get('file') as File;
      //validate the fields
      const validatedFields = schema.safeParse({ file });

      if (!validatedFields.success) {
        toast(' ❌ Error occurred while uploading', {
          description:
            validatedFields.error.flatten().fieldErrors.file?.[0] ??
            'Invalid file'
        });
        setIsLoading(false);
        return;
      }

      toast('📄 Uploading your PDF...', {
        description: ' This may take a few seconds...'
      });

      //upload the file to uploadthing
      const resp = await startUpload([file]);
      if (!resp) {
        toast.error(' ❌ Error occurred while uploading', {
          description: 'Please try again'
        });
        setIsLoading(false);
        return;
      }

      toast('✅ Processing your PDF...', {
        description: 'Hang tight, our AI is reading through your document...'
      });

      //parse the pdf using lang chain
      const result = await generatePdfSummary(resp);

      const { data = null, message = null } = result || {};

      if (data) {
        let storeResult: any;
        toast('📄 Saving your PDF summary...', {
          description: ' Hang tight, nearly there...'
        });
        //  console.log('data', data);

        if (data) {
          storeResult = await storePdfSummaryAction({
            fileUrl: data.fileUrl,
            summary: data.summary,
            title: data.title,
            fileName: data.fileName
          });
          toast('📄 Summary Generated', {
            description: 'Your PDF has been successfully summarised and saved!'
          });
          formRef.current?.reset();
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.error('error occurred while submitting', error);
      formRef.current?.reset();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto mt-2">
      <UploadFormInput
        isLoading={isLoading}
        ref={formRef}
        onSubmit={handleSubmit}
      />
      {isLoading && (
        <>
          <div className="relative">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="w-full border-t border-gray-200 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-muted-foreground text-sm">
                Processing
              </span>
            </div>
          </div>
          <LoadingSkeleton />
        </>
      )}
    </div>
  );
};
