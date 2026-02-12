import { Review } from "./review";
import { Event } from "./event";

export class Business {
    private id: string = "1";
    private reviews: Review[] = [];
    private events: Event[] = [];
    private bookmark = false;

    constructor(private name: string, private category: string, private description: string, private banner: string) {}

    // Mutator methods
    addReview(newReview: Review) {
        this.reviews.push(newReview);
    }
    addEvent(newEvent: Event) {
        this.events.push(newEvent);
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
    getBanner() {
        return this.banner;
    }
    getReviews(){
        return this.reviews;
    }
    getEvents(){
        return this.events;
    }
}
