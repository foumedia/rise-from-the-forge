// This file contains the JavaScript code for the website. 
// It includes functions for interactivity and managing events.

document.addEventListener('DOMContentLoaded', () => {
    const factionSections = document.querySelectorAll('.faction-section');

    factionSections.forEach(section => {
        section.addEventListener('click', () => {
            section.classList.toggle('active');
            const content = section.querySelector('.faction-content');
            content.style.display = content.style.display === 'block' ? 'none' : 'block';
        });
    });
});