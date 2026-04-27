const PDF_DB_NAME = "bd2_upla_files_v1";
const PDF_STORE = "pdfs";

function openPdfDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(PDF_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(PDF_STORE)) {
        db.createObjectStore(PDF_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("No se pudo abrir IndexedDB."));
  });
}

async function putPdf(key, file) {
  const db = await openPdfDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PDF_STORE, "readwrite");
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error || new Error("No se pudo guardar el PDF."));
    tx.objectStore(PDF_STORE).put(file, key);
  });
}

async function getPdf(key) {
  const db = await openPdfDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PDF_STORE, "readonly");
    const req = tx.objectStore(PDF_STORE).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error || new Error("No se pudo leer el PDF."));
  });
}

async function deletePdf(key) {
  const db = await openPdfDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PDF_STORE, "readwrite");
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error || new Error("No se pudo borrar el PDF."));
    tx.objectStore(PDF_STORE).delete(key);
  });
}

window.PdfStore = { putPdf, getPdf, deletePdf };

