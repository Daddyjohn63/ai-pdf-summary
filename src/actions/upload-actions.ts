// This is a server action - it runs on the server side only
'use server';

// Import the function that will handle PDF text extraction
import { fetchAndExtractPdfText } from '@/lib/langchain';
import { generateSummaryFromOpenAI } from '@/lib/openai';
import { generateSummaryFromGemini } from '@/lib/geminiai';
/**
 * Server action that processes an uploaded PDF file and extracts its text content
 * @param uploadResponse - The response from UploadThing containing file upload details
 * @returns Promise containing success status, message, and extracted text data
 */
export async function generatePdfSummary(
  // Define the expected structure of the upload response
  uploadResponse: {
    serverData: {
      userId: string; // ID of the user who uploaded the file
      fileUrl: string; // URL where the PDF is stored on UploadThing
      fileName: string; // Original name of the uploaded file
    };
  }[]
): Promise<{ success: boolean; message: string; data: any }> {
  // Check if we received a valid upload response
  if (!uploadResponse || !uploadResponse[0]) {
    return {
      success: false,
      message: 'File upload failed',
      data: null
    };
  }

  // Destructure the response to get the file details
  const {
    serverData: {
      userId,
      fileUrl: pdfUrl, // Rename fileUrl to pdfUrl for clarity
      fileName
    }
  } = uploadResponse[0];

  // Verify we have a valid PDF URL
  if (!pdfUrl) {
    return {
      success: false,
      message: 'PDF URL not found',
      data: null
    };
  }

  try {
    // Use LangChain to fetch the PDF and extract its text content
    const pdfText = await fetchAndExtractPdfText(pdfUrl);
    console.log('Extracted PDF text:', pdfText);

    // Generate a summary from the extracted text using OpenAI
    let summary;
    try {
      // summary = await generateSummaryFromOpenAI(pdfText);
      summary = await generateSummaryFromGemini(pdfText);
      console.log('Generated summary:', summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      // Handle Gemini service overload
      if (
        error instanceof Error &&
        error.message.includes('503 Service Unavailable')
      ) {
        return {
          success: false,
          message:
            'The AI service is currently overloaded. Please try again in a few minutes.',
          data: null
        };
      }
      //call gemini code if there is an error.
      if (
        error instanceof Error &&
        error.message.includes('RATE_LIMIT_EXCEEDED')
      ) {
        try {
          //call Gemini API
          const geminiSummary = await generateSummaryFromGemini(pdfText);
          console.log('Generated summary from Gemini:', geminiSummary);
          summary = geminiSummary;
        } catch (geminiError) {
          console.error(
            'Gemini API failed after OPenAI quota was exceeded:',
            geminiError
          );
        }
        throw new Error(
          'Failed to generate summary with available AI providers'
        );
      }
    }

    if (!summary) {
      return {
        success: false,
        message: 'Failed to generate summary',
        data: null
      };
    }

    // Return success with the extracted text
    return {
      success: true,
      message: 'PDF summary generated successfully',
      data: summary
    };
  } catch (err) {
    // Handle any errors during PDF processing
    console.error('Error extracting PDF text:', err);
    return {
      success: false,
      message: 'Failed to extract PDF text',
      data: null
    };
  }
}
