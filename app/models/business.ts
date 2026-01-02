class Business {
    private ratings: number[] = [];
    private reviews: string[] = [];
    private bookmark = false;

    constructor(private name: string, private category: string, private description: string) {}

    // Mutator methods
    addRating(newRating: number) {
        this.ratings.push(newRating);
    }
    addReview(newReview: string) {
        this.reviews.push(newReview);
    }
    addBookmark() {
        this.bookmark = true;
    }
    removeBookmark() {
        this.bookmark = false;
    }

    // Accessor methods
    getName() {
        return this.name;
    }
    getCategory() {
        return this.category;
    }
    getDescription() {
        return this.description;
    }
    ifBookmarked() {
        return this.bookmark;
    }

}

export { Business };

