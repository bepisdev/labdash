/**
 * Filter Module
 * Handles tag filtering and search functionality
 */

const FilterManager = {
  /**
   * Initialize tag filter dropdown
   */
  initialize() {
    const tagFilter = document.getElementById('tag-filter');
    if (!tagFilter) return;
    
    tagFilter.addEventListener('change', (e) => {
      const selectedTag = e.target.value;
      this.filterByTag(selectedTag);
    });
  },

  /**
   * Filter services by tag
   * @param {string} tag - Tag to filter by (empty string shows all)
   */
  filterByTag(tag) {
    const serviceCards = document.querySelectorAll('.service-card');
    const categorySections = document.querySelectorAll('.category-section');
    
    // Filter service cards
    serviceCards.forEach(card => {
      const cardTags = card.dataset.tags || '';
      const tagsArray = cardTags.split(',').filter(t => t.trim());
      
      if (tag === '' || tagsArray.includes(tag)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
    
    // Hide categories that have no visible services
    categorySections.forEach(section => {
      const visibleCards = section.querySelectorAll('.service-card:not([style*="display: none"])');
      if (visibleCards.length === 0) {
        section.style.display = 'none';
      } else {
        section.style.display = '';
      }
    });
  },

  /**
   * Clear all filters
   */
  clearFilters() {
    const tagFilter = document.getElementById('tag-filter');
    if (tagFilter) {
      tagFilter.value = '';
      this.filterByTag('');
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FilterManager;
}
