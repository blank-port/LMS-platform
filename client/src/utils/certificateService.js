import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generates a high-fidelity PDF from a certificate DOM element.
 * @param {HTMLElement} element - The DOM element to render
 * @param {Object} data - Metadata for the PDF filename
 */
export const generateCertificatePDF = async (element, { courseTitle, studentName }) => {
    try {
        const canvas = await html2canvas(element, {
            scale: 3,
            useCORS: true,
            backgroundColor: '#0C132B'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('l', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${courseTitle.replace(/\s+/g, '_')}_Certificate.pdf`);
        return true;
    } catch (error) {
        console.error('PDF Generation Failure:', error);
        throw error;
    }
};
