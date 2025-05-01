const hide = (elements) => {
    elements.forEach((element) => {
       element.classList.add("hidden");
       element.classList.remove("visible");
    });
 }
 
 const show = (element) => {
    element.classList.add("visible");
    element.classList.remove("hidden");   
 }
 
 export const createNavigator = (parentElement) => {
    const pages = Array.from(parentElement.querySelectorAll(".page"));
    
    const render = () => {
       const url = new URL(document.location.href);
       const hash = url.hash.replace("#", "");

      let selectedPageId = hash;
      let dynamicId = null;

      // Gestione hash tipo: dettaglio_42
      if (hash.startsWith("dettaglio_")) {
      selectedPageId = "dettaglio";
      dynamicId = hash.split("_")[1];
      }

      const selected = pages.find((page) => page.id === selectedPageId) || pages[0];

      hide(pages);
      show(selected);

      // Se è un dettaglio evento, caricalo dinamicamente
      if (selectedPageId === "dettaglio" && dynamicId) {
         import('./script.js').then(module => {
            if (typeof module.caricaDettaglioEvento === 'function') {
               module.caricaDettaglioEvento(dynamicId);
            }
         }).catch(err => {
            console.error("Errore nel caricamento dettaglio evento:", err);
         });
      }

         }
    window.addEventListener('popstate', render); 
    render();   
 }