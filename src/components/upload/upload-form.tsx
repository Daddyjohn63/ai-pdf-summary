'use client';

import { useUploadThing } from '@/utils/uploadthing';
import { UploadFormInput } from './upload-form-input';
import { z } from 'zod';
import { toast } from 'sonner';
import { generatePdfSummary } from '@/actions/upload-actions';

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
    console.log('submitted');
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
      return;
    }

    toast('✅ Processing your PDF...', {
      description: 'Hang tight, our AI is reading through your document...'
    });

    //parse the pdf using lang chain
    const summary = await generatePdfSummary(resp);
    console.log({ summary });
    //summarize the pdf using AI
    //save the summary to the database
    //redirect to the summary page
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto mt-2">
      <UploadFormInput onSubmit={handleSubmit} />
    </div>
  );
};
