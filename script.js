document.addEventListener('DOMContentLoaded', () => {
    // Seleciona todos os links de navegação e as seções de conteúdo
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    const mainContent = document.querySelector('main');

    /**
     * Alterna a visibilidade das seções de conteúdo e atualiza o estado ativo dos links.
     * @param {string} targetId - O ID da seção a ser mostrada (ex: 'livro', 'sinopse').
     */
    function showSection(targetId) {
        // 1. Esconde todas as seções e remove a classe 'active' de todos os links
        contentSections.forEach(section => {
            section.classList.add('hidden');
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // 2. Mostra a seção alvo e define o link correspondente como 'active'
        const targetSection = document.getElementById(targetId);
        const targetLink = document.querySelector(`a[href="#${targetId}"]`);
        
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }
        if (targetLink) {
            targetLink.classList.add('active');
        }
    }

    // Adiciona um listener de evento de clique a cada link de navegação
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            // Previne o comportamento padrão do link (evita a rolagem brusca)
            event.preventDefault();

            // Pega o ID da seção alvo (o hash do href, sem o '#')
            const targetId = link.getAttribute('href').substring(1);

            // Chama a função para mostrar a seção
            showSection(targetId);

            // Rola a página para o topo do conteúdo principal
            if (mainContent) {
                 mainContent.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // 3. Inicialização: Ao carregar, verifica o hash da URL para carregar a seção correta, 
    // ou mostra a seção 'livro' por padrão.
    const initialHash = window.location.hash.substring(1);
    if (initialHash && document.getElementById(initialHash)) {
        showSection(initialHash);
    } else {
        showSection('livro'); 
    }
});