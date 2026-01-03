export class Review {
    private id: string = "1";

    constructor(private rating: number, private comment: string, private date: Date, private customer: string) {}

    editComment(newComment: string) {
        this.comment = newComment;
    }

    editRating(newRating: number) {
        this.rating = newRating;
    }

    getReview() {
        return { id: this.id, rating: this.rating, comment: this.comment, date: this.date, customer: this.customer };
    }
}