import mammoth from 'mammoth';
import { readFile } from 'fs/promises';

/**
 * Parse uploaded file and extract text content
 */
export async function parseFile(filePath: string, mimeType: string): Promise<string> {
  try {
    if (mimeType.includes('wordprocessingml') || mimeType.includes('msword') || filePath.endsWith('.docx')) {
      // Word document
      const buffer = await readFile(filePath);
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else if (mimeType === 'application/pdf' || filePath.endsWith('.pdf')) {
      // PDF not supported yet - skip for now
      throw new Error('PDF support coming soon. Please use .docx or .txt files');
    } else if (mimeType.startsWith('text/') || filePath.endsWith('.txt')) {
      // Plain text
      return await readFile(filePath, 'utf-8');
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (error) {
    console.error(`Error parsing file ${filePath}:`, error);
    throw new Error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse multiple files and return array of text content
 */
export async function parseMultipleFiles(files: Array<{ path: string; mimeType: string }>): Promise<string[]> {
  const results: string[] = [];
  
  for (const file of files) {
    try {
      const text = await parseFile(file.path, file.mimeType);
      results.push(text);
    } catch (error) {
      console.error(`Skipping file ${file.path} due to error:`, error);
      // Continue with other files even if one fails
    }
  }
  
  return results;
}
