const STORAGE_KEY = 'gh_analyzer_history_v1';
const MAX_HISTORY_ITEMS = 30;

export const historyStorage = {
  getHistory: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Failed to parse analysis history from localStorage:', e);
      return [];
    }
  },

  saveAnalysis: (analysisResponse) => {
    if (!analysisResponse || !analysisResponse.metadata) return;

    try {
      const history = historyStorage.getHistory();
      const item = {
        fullName: analysisResponse.metadata.full_name,
        owner: analysisResponse.metadata.owner,
        repo: analysisResponse.metadata.repo,
        htmlUrl: analysisResponse.metadata.html_url,
        score: analysisResponse.summary.overall_score,
        statusLabel: analysisResponse.summary.status_label,
        statusTone: analysisResponse.summary.status_tone,
        language: analysisResponse.metadata.language,
        stars: analysisResponse.metadata.stars_count,
        analyzedAt: analysisResponse.analyzed_at || new Date().toISOString(),
        fullData: analysisResponse, // store cached report for immediate opening
      };

      // Remove existing entry for the same repository to move to top
      const filtered = history.filter((h) => h.fullName.toLowerCase() !== item.fullName.toLowerCase());
      filtered.unshift(item);

      // Limit length
      const trimmed = filtered.slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('Failed to save analysis to localStorage:', e);
    }
  },

  getAnalysisByRepo: (fullName) => {
    if (!fullName) return null;
    const history = historyStorage.getHistory();
    const found = history.find((h) => h.fullName.toLowerCase() === fullName.toLowerCase());
    return found ? found.fullData : null;
  },

  removeHistoryItem: (fullName) => {
    try {
      const history = historyStorage.getHistory();
      const updated = history.filter((h) => h.fullName.toLowerCase() !== fullName.toLowerCase());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn('Failed to remove history item:', e);
      return [];
    }
  },

  clearHistory: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear history:', e);
    }
  },
};
