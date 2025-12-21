import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
    const previewFiles: File[] = [];

    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

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
    }

    return previewFiles;
}
