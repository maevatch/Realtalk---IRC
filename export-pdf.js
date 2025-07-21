const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function exportToPDF() {
  console.log('🚀 Démarrage de l\'export PDF...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Chemin vers le fichier HTML
  const htmlPath = path.join(__dirname, 'presentation_realtalk.html');
  const fileUrl = `file://${htmlPath}`;
  
  console.log(`📄 Chargement de: ${fileUrl}`);
  
  // Charger la page
  await page.goto(fileUrl, { 
    waitUntil: 'networkidle0',
    timeout: 30000 
  });
  
  // Attendre que le contenu soit complètement chargé
  await page.waitForTimeout(2000);
  
  // Configuration PDF optimisée pour les slides
  const pdfOptions = {
    path: 'presentation_realtalk.pdf',
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: false,
    margin: {
      top: '0mm',
      right: '0mm',
      bottom: '0mm',
      left: '0mm'
    }
  };
  
  console.log('📊 Génération du PDF...');
  
  // Générer le PDF
  await page.pdf(pdfOptions);
  
  await browser.close();
  
  console.log('✅ PDF généré avec succès : presentation_realtalk.pdf');
  
  // Vérifier que le fichier existe
  if (fs.existsSync('./presentation_realtalk.pdf')) {
    const stats = fs.statSync('./presentation_realtalk.pdf');
    console.log(`📁 Taille du fichier: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  }
}

// Gestion des erreurs
exportToPDF().catch(error => {
  console.error('❌ Erreur lors de l\'export:', error);
  process.exit(1);
});