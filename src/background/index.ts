console.log('UTSA Registration Plus: Background Service Worker Started');

interface RatingResponse {
    rating: number;
    count: number;
    url: string;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getProfessorRating') {
        // In a production environment, this would hit a secondary API or parse RMP
        // For now, we simulate a robust response
        const mockRatings: Record<string, RatingResponse> = {
            'Default': { rating: 4.0, count: 12, url: 'https://www.ratemyprofessors.com' },
            'Murtuza Jadliwala': { rating: 4.8, count: 45, url: '#' },
            'Rajendra Boppana': { rating: 4.2, count: 30, url: '#' }
        };

        const instructor = request.instructor;
        const response = mockRatings[instructor] || mockRatings['Default'];

        // Simulate network delay
        setTimeout(() => {
            sendResponse(response);
        }, 500);

        return true; // async signifier
    }
});
