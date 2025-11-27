class Business {
    #name;
    #category;
    #description;
    #ratings = [];
    #reviews = [];
    #bookmark;

    constructor(name, category, description) {
        this.#name = name;
        this.#category = category;
        this.#description = description;
        this.#bookmark = false;
    }


    // Mutator methods
    addRating(newRating) {
        this.#ratings.push(newRating);
    }
    addReview(newReview) {
        this.#reviews.push(newReview);
    }
    addBookmark() {
        this.#bookmark = true;
    }
    removeBookmark() {
        this.#bookmark = false;
    }

    // Accessor methods
    getName() {
        return this.#name;
    }
    getCategory() {
        return this.#category;
    }
    getDescription() {
        return this.#description;
    }
    ifBookmarked() {
        return this.#bookmark;
    }

}

export { Business };