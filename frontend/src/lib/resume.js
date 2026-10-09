// The résumé PDF ships with the site (public/Bretton_Key_Resume.pdf). A URL set in
// Admin → Settings → Resume PDF URL wins, so it can be swapped without a deploy.
export const RESUME_PDF = "/Bretton_Key_Resume.pdf";
export const RESUME_PAGES = ["/resume-page-1.webp", "/resume-page-2.webp"];
export const resumeUrl = (settings) => settings?.resume_pdf_url || RESUME_PDF;
