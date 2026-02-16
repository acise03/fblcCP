import { Review } from "./review";
import { Event } from "./event";

export class Business {
    private id: string = "1";
    private reviews: Review[] = [];
    private events: Event[] = [];
    private bookmark = false;
    private coordinate: { latitude: number; longitude: number };

    constructor(private name: string, private category: string, private description: string, private banner: string, private latitude: number, private longitude: number ) {
        this.coordinate = { latitude, longitude };
    }

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
    setCoordinate(lat: number, lng: number) {
        this.coordinate = { latitude: lat, longitude: lng };
    }

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
    getCoordinate(){
        return this.coordinate;
    }
}
