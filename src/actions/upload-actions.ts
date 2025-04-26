// This is a server action - it runs on the server side only
'use server';

// Import the function that will handle PDF text extraction
import { fetchAndExtractPdfText } from '@/lib/langchain';
import { generateSummaryFromOpenAI } from '@/lib/openai';
import { generateSummaryFromGemini } from '@/lib/geminiai';
import { getDbConnection } from '@/db/db';
import { auth } from '@clerk/nextjs/server';
import { formatFileNameAsTitle } from '@/utils/format-utils';
/**
 * Server action that processes an uploaded PDF file and extracts its text content
 * @param uploadResponse - The response from UploadThing containing file upload details
 * @returns Promise containing success status, message, and extracted text data
 */

interface PdfSummaryType {
  userId?: string;
  fileUrl: string;
  summary: string;
  title: string;
  fileName: string;
}

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
      // Try OpenAI first
      summary = await generateSummaryFromOpenAI(pdfText);
      console.log('Generated summary:', summary);
    } catch (error) {
      console.error('Error generating summary with OpenAI:', error);

      // Handle OpenAI errors
      if (error instanceof Error) {
        if (error.message.includes('503 Service Unavailable')) {
          return {
            success: false,
            message:
              'The AI service is currently overloaded. Please try again in a few minutes.',
            data: null
          };
        }
        if (
          error.message.includes('429') ||
          error.message.includes('RATE_LIMIT_EXCEEDED')
        ) {
          // Only try Gemini if OpenAI rate limit is exceeded
          try {
            console.log('OpenAI rate limit exceeded, trying Gemini...');
            summary = await generateSummaryFromGemini(pdfText);
            //  console.log('Generated summary from Gemini:', summary);
          } catch (geminiError) {
            console.error('Error generating summary with Gemini:', geminiError);
            if (geminiError instanceof Error) {
              if (
                geminiError.message.includes('503 Service Unavailable') ||
                geminiError.message.includes('429') ||
                geminiError.message.includes('RATE_LIMIT_EXCEEDED')
              ) {
                return {
                  success: false,
                  message:
                    'All AI services are currently unavailable. Please try again in a few minutes.',
                  data: null
                };
              }
            }
            return {
              success: false,
              message: 'Failed to generate summary with available AI providers',
              data: null
            };
          }
        } else {
          return {
            success: false,
            message: 'Failed to generate summary with OpenAI',
            data: null
          };
        }
      }
    }

    if (!summary) {
      return {
        success: false,
        message: 'Failed to generate summary',
        data: null
      };
    }
    const formattedFileName = formatFileNameAsTitle(fileName);
    // Return success with the extracted text
    return {
      success: true,
      message: 'PDF summary generated successfully',
      data: {
        title: formattedFileName,
        summary: summary,
        fileUrl: pdfUrl,
        fileName: fileName
      }
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

async function savePdfSummary({
  userId,
  fileUrl,
  summary,
  title,
  fileName
}: PdfSummaryType) {
  //sql to insert pdf summary into database

  try {
    const db = await getDbConnection();
    const result = await db.query(
      `
      INSERT INTO pdf_summaries (
        user_id,
        original_file_url,
        summary_text,
        title,
        file_name
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id, summary_text
    `,
      [userId, fileUrl, summary, title, fileName]
    );
    const savedSummary = result.rows[0];
    return savedSummary;
  } catch (error) {
    console.error('Error saving PDF summary', error);
    throw error;
  }
}

export async function storePdfSummaryAction({
  fileUrl,
  summary,
  title,
  fileName
}: PdfSummaryType) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        message: 'User not authenticated',
        data: null
      };
    }

    const savedSummary = await savePdfSummary({
      userId,
      fileUrl,
      summary,
      title,
      fileName
    });

    if (!savedSummary) {
      return {
        success: false,
        message: 'Failed to save PDF summary, please try again...',
        data: null
      };
    }

    return {
      success: true,
      message: 'PDF summary saved successfully',
      data: {
        id: savedSummary.id
      }
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Error saving PDF summary',
      data: null
    };
  }
}
