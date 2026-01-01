import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

// Ensure worker is configured (should already be set in pdfUtils.ts, but set here for safety)
if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export interface CompressionResult {
    compressedFile: File;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
}

/**
 * Compress a PDF file by re-rendering pages as JPEG images
 * @param file - The PDF file to compress
 * @param quality - JPEG quality (0-1), default 0.75
 * @param scale - Render scale for quality, default 1.5
 * @returns Compressed PDF file with metadata
 */
export async function compressPdf(
    file: File,
    quality: number = 0.75,
    scale: number = 1.5
): Promise<CompressionResult> {
    const originalSize = file.size;

    // Load the PDF using pdfjs-dist
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    // Create a new PDF document
    const newPdf = await PDFDocument.create();

    console.log(`Compressing PDF with ${pdf.numPages} pages...`);

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        // Create canvas for rendering
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
            throw new Error(`Failed to get canvas context for page ${i}`);
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render page to canvas
        await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
        }).promise;

        // Convert canvas to JPEG blob
        const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
                (b) => {
                    if (b) resolve(b);
                    else reject(new Error('Failed to create blob'));
                },
                'image/jpeg',
                quality
            );
        });

        // Convert blob to ArrayBuffer
        const imageData = await blob.arrayBuffer();
        const jpgImage = await newPdf.embedJpg(new Uint8Array(imageData));

        // Get original page dimensions for proper sizing
        const originalViewport = page.getViewport({ scale: 1 });

        // Add page with same dimensions as original
        const newPage = newPdf.addPage([originalViewport.width, originalViewport.height]);

        // Draw the image to fill the page
        newPage.drawImage(jpgImage, {
            x: 0,
            y: 0,
            width: originalViewport.width,
            height: originalViewport.height,
        });

        console.log(`Compressed page ${i} of ${pdf.numPages}`);
    }

    // Save the new PDF
    const compressedBytes = await newPdf.save();
    const compressedSize = compressedBytes.length;

    // Create a File object from the compressed PDF
    // Convert Uint8Array to Blob first to avoid TypeScript issues
    const compressedBlob = new Blob([compressedBytes as BlobPart], { type: 'application/pdf' });
    const compressedFile = new File(
        [compressedBlob],
        file.name,
        { type: 'application/pdf' }
    );

    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

    console.log(`PDF compressed: ${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)} (${compressionRatio.toFixed(1)}% reduction)`);

    return {
        compressedFile,
        originalSize,
        compressedSize,
        compressionRatio,
    };
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
