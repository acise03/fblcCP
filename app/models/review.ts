class Review {
    constructor(private rating: number, private comment: string) {}

    editComment(newComment: string) {
        this.comment = newComment;
    }

    editRating(newRating: number) {
        this.rating = newRating;
    }

    getReview() {
        return { rating: this.rating, comment: this.comment };
    }
}