export class Announcement {
    private id: string = "1";

    constructor(private text: string, private date: Date, private business: string) {}

    getAnnouncement() {
        return { id: this.id, text: this.text, date: this.date, business: this.business }
    }
    getID() {
        return this.id;
    }
}