/**
 * Portfolio Ephraim Wayanga Bolingo
 * Script principal gérant la navigation AJAX, les animations et le thème
 */

// Variables globales
let pageActuelle = 'accueil';
let observateurAnimations = null;
let menuMobileOuvert = false;

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initialisation du portfolio Ephraim Wayanga Bolingo');
    
    initialiserNavigation();
    initialiserTheme();
    initialiserAnimations();
    initialiserMenuMobile();
    chargerPage('accueil');
    
    console.log('✅ Portfolio initialisé avec succès');
});

/**
 * Initialise le système de navigation AJAX
 */
function initialiserNavigation() {
    console.log('📱 Initialisation de la navigation AJAX');
    
    // Gestion des clics sur les liens de navigation
    document.addEventListener('click', function(event) {
        const lien = event.target.closest('[data-page]');
        if (lien) {
            event.preventDefault();
            const nomPage = lien.getAttribute('data-page');
            naveguerVers(nomPage);
        }
    });
    
    // Gestion du bouton retour du navigateur
    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.page) {
            chargerPage(event.state.page, false);
        }
    });
}

/**
 * Navigation vers une page spécifique
 * @param {string} nomPage - Nom de la page à charger
 */
function naveguerVers(nomPage) {
    console.log(`🔄 Navigation vers: ${nomPage}`);
    
    if (nomPage === pageActuelle) {
        console.log('⚠️ Page déjà active, navigation annulée');
        return;
    }
    
    chargerPage(nomPage, true);
}

/**
 * Charge une page via AJAX
 * @param {string} nomPage - Nom de la page à charger
 * @param {boolean} ajouterHistorique - Ajouter à l'historique du navigateur
 */
async function chargerPage(nomPage, ajouterHistorique = true) {
    try {
        console.log(`📄 Chargement de la page: ${nomPage}`);
        
        // Afficher l'indicateur de chargement
        afficherIndicateurChargement(true);
        
        // Construire l'URL de la page
        const urlPage = nomPage === 'accueil' ? 'pages/accueil.html' : `pages/${nomPage}.html`;
        
        // Effectuer la requête AJAX
        const reponse = await fetch(urlPage);
        
        if (!reponse.ok) {
            throw new Error(`Erreur HTTP: ${reponse.status}`);
        }
        
        const contenuHtml = await reponse.text();
        
        // Mettre à jour le contenu principal avec animation
        await remplacerContenuAvecAnimation(contenuHtml);
        
        // Mettre à jour la navigation
        mettreAJourNavigationActive(nomPage);
        
        // Mettre à jour l'historique du navigateur
        if (ajouterHistorique) {
            const titre = obtenirTitrePage(nomPage);
            document.title = `${titre} - Ephraim Wayanga Bolingo`;
            history.pushState({ page: nomPage }, titre, `#${nomPage}`);
        }
        
        // Mettre à jour la page actuelle
        pageActuelle = nomPage;
        
        // Réinitialiser les animations pour les nouveaux éléments
        reinitialiserAnimations();
        
        // Faire défiler vers le haut
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        console.log(`✅ Page ${nomPage} chargée avec succès`);
        
    } catch (erreur) {
        console.error('❌ Erreur lors du chargement de la page:', erreur);
        afficherErreurChargement();
    } finally {
        // Masquer l'indicateur de chargement
        afficherIndicateurChargement(false);
    }
}

/**
 * Remplace le contenu avec une animation fluide
 * @param {string} nouveauContenu - Nouveau contenu HTML
 */
function remplacerContenuAvecAnimation(nouveauContenu) {
    return new Promise((resoudre) => {
        const contenuPrincipal = document.getElementById('contenuPrincipal');
        
        // Animation de sortie
        contenuPrincipal.style.opacity = '0';
        contenuPrincipal.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            // Remplacer le contenu
            contenuPrincipal.innerHTML = nouveauContenu;
            
            // Animation d'entrée
            requestAnimationFrame(() => {
                contenuPrincipal.style.opacity = '1';
                contenuPrincipal.style.transform = 'translateY(0)';
                resoudre();
            });
        }, 200);
    });
}

/**
 * Met à jour l'état actif de la navigation
 * @param {string} nomPage - Nom de la page active
 */
function mettreAJourNavigationActive(nomPage) {
    // Supprimer la classe active de tous les liens
    document.querySelectorAll('.lien-navigation').forEach(lien => {
        lien.classList.remove('actif');
    });
    
    // Ajouter la classe active au lien correspondant
    document.querySelectorAll(`[data-page="${nomPage}"]`).forEach(lien => {
        if (lien.classList.contains('lien-navigation')) {
            lien.classList.add('actif');
        }
    });
}

/**
 * Obtient le titre de la page
 * @param {string} nomPage - Nom de la page
 * @returns {string} Titre de la page
 */
function obtenirTitrePage(nomPage) {
    const titres = {
        'accueil': 'Accueil',
        'apropos': 'À propos',
        'competences': 'Compétences',
        'projets': 'Projets',
        'experience': 'Expérience',
        'contact': 'Contact'
    };
    
    return titres[nomPage] || 'Portfolio';
}

/**
 * Affiche ou masque l'indicateur de chargement
 * @param {boolean} afficher - True pour afficher, false pour masquer
 */
function afficherIndicateurChargement(afficher) {
    const indicateur = document.getElementById('indicateurChargement');
    if (indicateur) {
        indicateur.style.display = afficher ? 'flex' : 'none';
    }
}

/**
 * Affiche un message d'erreur en cas d'échec du chargement
 */
function afficherErreurChargement() {
    const contenuPrincipal = document.getElementById('contenuPrincipal');
    contenuPrincipal.innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem; color: var(--couleur-erreur);">
            <h2>Erreur de chargement</h2>
            <p>Impossible de charger la page demandée. Veuillez réessayer.</p>
            <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--couleur-primaire); color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
                Recharger la page
            </button>
        </div>
    `;
}

/**
 * Initialise le système de thème clair/sombre
 */
function initialiserTheme() {
    console.log('🎨 Initialisation du système de thème');
    
    const boutonTheme = document.getElementById('boutonTheme');
    
    // Récupérer le thème sauvegardé ou utiliser le thème par défaut
    const themeSauvegarde = localStorage.getItem('theme-portfolio') || 'clair';
    appliquerTheme(themeSauvegarde);
    
    // Gérer le clic sur le bouton de thème
    if (boutonTheme) {
        boutonTheme.addEventListener('click', basculerTheme);
    }
}

/**
 * Bascule entre les thèmes clair et sombre
 */
function basculerTheme() {
    const themeActuel = document.documentElement.getAttribute('data-theme') || 'clair';
    const nouveauTheme = themeActuel === 'clair' ? 'sombre' : 'clair';
    
    console.log(`🎨 Basculement du thème: ${themeActuel} → ${nouveauTheme}`);
    
    appliquerTheme(nouveauTheme);
    localStorage.setItem('theme-portfolio', nouveauTheme);
}

/**
 * Applique un thème spécifique
 * @param {string} theme - 'clair' ou 'sombre'
 */
function appliquerTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Animation fluide pour la transition de thème
    document.body.style.transition = 'all 0.3s ease-in-out';
    
    setTimeout(() => {
        document.body.style.transition = '';
    }, 300);
    
    console.log(`✅ Thème appliqué: ${theme}`);
}

/**
 * Initialise le système d'animations au défilement
 */
function initialiserAnimations() {
    console.log('✨ Initialisation des animations au défilement');
    
    // Configuration de l'Intersection Observer
    const optionsObservateur = {
        root: null,
        rootMargin: '-50px',
        threshold: 0.1
    };
    
    // Créer l'observateur d'intersections
    observateurAnimations = new IntersectionObserver(gererAnimationsVisibilite, optionsObservateur);
    
    // Observer tous les éléments avec animation
    observerElementsAnimation();
}

/**
 * Observe tous les éléments avec des animations
 */
function observerElementsAnimation() {
    const elementsAnimation = document.querySelectorAll('.animation-entree');
    
    elementsAnimation.forEach((element, index) => {
        // Appliquer un délai d'animation si spécifié
        const delai = element.getAttribute('data-delay');
        if (delai) {
            element.style.transitionDelay = `${delai}ms`;
        }
        
        // Observer l'élément
        observateurAnimations.observe(element);
    });
    
    console.log(`👀 ${elementsAnimation.length} éléments observés pour les animations`);
}

/**
 * Gère la visibilité des animations
 * @param {IntersectionObserverEntry[]} entrees - Entrées de l'observateur
 */
function gererAnimationsVisibilite(entrees) {
    entrees.forEach(entree => {
        if (entree.isIntersecting) {
            // L'élément entre dans la zone visible
            entree.target.classList.add('visible');
        } else {
            // L'élément sort de la zone visible - réinitialiser l'animation
            entree.target.classList.remove('visible');
        }
    });
}

/**
 * Réinitialise les animations pour les nouveaux éléments
 */
function reinitialiserAnimations() {
    // Déconnecter l'ancien observateur
    if (observateurAnimations) {
        observateurAnimations.disconnect();
    }
    
    // Réinitialiser l'observateur avec les nouveaux éléments
    setTimeout(() => {
        observerElementsAnimation();
    }, 100);
}

/**
 * Initialise le menu mobile
 */
function initialiserMenuMobile() {
    console.log('📱 Initialisation du menu mobile');
    
    const boutonMenuMobile = document.getElementById('boutonMenuMobile');
    
    if (boutonMenuMobile) {
        boutonMenuMobile.addEventListener('click', basculerMenuMobile);
    }
    
    // Fermer le menu mobile lors du clic sur un lien
    document.addEventListener('click', function(event) {
        const lienNavigation = event.target.closest('.lien-navigation');
        if (lienNavigation && menuMobileOuvert) {
            basculerMenuMobile();
        }
    });
}

/**
 * Bascule l'état du menu mobile
 */
function basculerMenuMobile() {
    menuMobileOuvert = !menuMobileOuvert;
    const menuNavigation = document.querySelector('.menu-navigation');
    const boutonMenuMobile = document.getElementById('boutonMenuMobile');
    
    if (menuNavigation) {
        if (menuMobileOuvert) {
            menuNavigation.style.display = 'flex';
            menuNavigation.style.flexDirection = 'column';
            menuNavigation.style.position = 'absolute';
            menuNavigation.style.top = '100%';
            menuNavigation.style.left = '0';
            menuNavigation.style.right = '0';
            menuNavigation.style.background = 'var(--fond-navigation)';
            menuNavigation.style.boxShadow = 'var(--ombre-moyenne)';
            menuNavigation.style.padding = 'var(--espacement-lg)';
            menuNavigation.style.gap = 'var(--espacement-md)';
            boutonMenuMobile.classList.add('ouvert');
        } else {
            menuNavigation.style.display = '';
            menuNavigation.style.flexDirection = '';
            menuNavigation.style.position = '';
            menuNavigation.style.top = '';
            menuNavigation.style.left = '';
            menuNavigation.style.right = '';
            menuNavigation.style.background = '';
            menuNavigation.style.boxShadow = '';
            menuNavigation.style.padding = '';
            menuNavigation.style.gap = '';
            boutonMenuMobile.classList.remove('ouvert');
        }
    }
    
    console.log(`📱 Menu mobile ${menuMobileOuvert ? 'ouvert' : 'fermé'}`);
}

/**
 * Fonctions utilitaires globales
 */

// Fonction pour faire défiler vers une section
function faireDefilerVers(selecteur) {
    const element = document.querySelector(selecteur);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Fonction pour copier du texte dans le presse-papiers
async function copierDansPressePapiers(texte) {
    try {
        await navigator.clipboard.writeText(texte);
        console.log('📋 Texte copié dans le presse-papiers:', texte);
        
        // Afficher une notification de succès
        afficherNotification('Copié dans le presse-papiers !', 'succes');
    } catch (erreur) {
        console.error('❌ Erreur lors de la copie:', erreur);
        afficherNotification('Erreur lors de la copie', 'erreur');
    }
}

// Fonction pour afficher des notifications
function afficherNotification(message, type = 'info') {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Styles de base
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: 'var(--espacement-md) var(--espacement-lg)',
        borderRadius: 'var(--rayon-moyen)',
        boxShadow: 'var(--ombre-forte)',
        zIndex: '10001',
        color: 'white',
        fontWeight: '500',
        transform: 'translateX(100%)',
        transition: 'transform var(--transition-normale)',
        maxWidth: '300px'
    });
    
    // Couleurs selon le type
    const couleurs = {
        info: 'var(--couleur-primaire)',
        succes: 'var(--couleur-succes)',
        avertissement: 'var(--couleur-avertissement)',
        erreur: 'var(--couleur-erreur)'
    };
    
    notification.style.background = couleurs[type] || couleurs.info;
    
    // Ajouter au DOM
    document.body.appendChild(notification);
    
    // Animer l'entrée
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });
    
    // Supprimer après 3 secondes
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Fonction pour débugger les animations
function debuggerAnimations() {
    const elements = document.querySelectorAll('.animation-entree');
    console.log('🐛 Éléments avec animations:', elements.length);
    
    elements.forEach((element, index) => {
        console.log(`${index + 1}. ${element.tagName}:`, {
            classes: element.className,
            animation: element.getAttribute('data-animation'),
            delai: element.getAttribute('data-delay'),
            visible: element.classList.contains('visible')
        });
    });
}

// Exposer les fonctions utiles globalement
window.naveguerVers = naveguerVers;
window.copierDansPressePapiers = copierDansPressePapiers;
window.faireDefilerVers = faireDefilerVers;
window.debuggerAnimations = debuggerAnimations;


/* ----- Modal "Mise à jour" pour les projets non publiés ----- */
(function(){
  // Crée le modal si nécessaire et retourne l'élément
  function creerModalMiseAJour() {
    if (document.getElementById('modal-mise-a-jour')) return document.getElementById('modal-mise-a-jour');

    const overlay = document.createElement('div');
    overlay.id = 'modal-mise-a-jour';
    overlay.className = 'modal-overlay';

    overlay.innerHTML = `
      <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-miseajour-title">
        <h3 id="modal-miseajour-title">Mise à jour en cours</h3>
        <p>Veuillez réessayer plus tard !</p>
        <div style="text-align:center;">
          <button class="modal-close" aria-label="Fermer la fenêtre">OK</button>
        </div>
      </div>
    `;

    // fermer en cliquant en dehors du contenu
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) fermerModal();
    });

    // fermer sur escape
    function onEsc(e){
      if (e.key === 'Escape') fermerModal();
    }
    document.addEventListener('keydown', onEsc);

    // méthode de fermeture
    function fermerModal(){
      const m = document.getElementById('modal-mise-a-jour');
      if (!m) return;
      m.classList.remove('visible');
      document.body.style.overflow = '';
      // suppression après l'animation
      setTimeout(()=> { if (m.parentNode) m.remove(); document.removeEventListener('keydown', onEsc); }, 220);
    }

    // bouton de fermeture (sera attaché après insertion dans DOM)
    overlay.querySelector('.modal-close').addEventListener('click', fermerModal);

    document.body.appendChild(overlay);
    // petit délai pour déclencher transition CSS
    requestAnimationFrame(()=> overlay.classList.add('visible'));
    document.body.style.overflow = 'hidden';
    // focus sur bouton
    overlay.querySelector('.modal-close').focus();

    return overlay;
  }

  // Ouvre le modal (utile aussi depuis la console)
  function ouvrirModalMiseAJour(){
    return creerModalMiseAJour();
  }

  // Interception des clics : cible l'élément par id ou par attribut data-update
  document.addEventListener('click', function(e){
    const lien = e.target.closest('#lienUpdateX937, a.lien-projet[data-update="true"], a[data-disabled="true"]');
    if (!lien) return;
    // Empêche toute redirection (même target=_blank)
    e.preventDefault();
    e.stopPropagation();
    ouvrirModalMiseAJour();
  });

  // expose pour debug si besoin
  window.ouvrirModalMiseAJour = ouvrirModalMiseAJour;
})();
