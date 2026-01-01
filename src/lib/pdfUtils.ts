import * as pdfjsLib from 'pdfjs-dist';

// Use unpkg CDN which has all versions available
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

/**
 * Extract preview images from PDF file (first N pages)
 */
export async function extractPdfPreviews(
    file: File,
    maxPages: number = 4,
    scale: number = 1.5
): Promise<File[]> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const numPages = Math.min(pdf.numPages, maxPages);
    console.log(`PDF has ${pdf.numPages} pages, extracting ${numPages} preview pages`);

    const previewFiles: File[] = [];

    for (let i = 1; i <= numPages; i++) {
        try {
            console.log(`Extracting page ${i}...`);
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale });

            // Create canvas
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) {
                console.error(`Failed to get canvas context for page ${i}`);
                continue;
            }

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            // Render page to canvas
            await page.render({
                canvasContext: context,
                viewport: viewport,
                canvas: canvas,
            }).promise;

            // Convert canvas to blob
            const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((blob) => {
                    resolve(blob || new Blob());
                }, 'image/jpeg', 0.9);
            });

            // Create File from blob
            const previewFile = new File([blob], `preview_page_${i}.jpg`, { type: 'image/jpeg' });
            previewFiles.push(previewFile);
            console.log(`Successfully extracted page ${i}`);
        } catch (error) {
            console.error(`Error extracting page ${i}:`, error);
        }
    }

    console.log(`Extracted ${previewFiles.length} preview pages`);
    return previewFiles;
}
