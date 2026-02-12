export class Event {
    private id: string = "1";

    constructor(private name: string, private description: string, private startDate: Date, private endDate: Date) {}

    editDescription(newDescription: string) {
        this.description = newDescription;
    }

    editChangeDate(newStartDate: Date, newEndDate: Date) {
        this.startDate = newStartDate;
        this.endDate = newEndDate;
    }

    getName() {
        return this.name;
    }
    getDescription() {
        return this.description;
    }
    getStart(){
        return this.startDate; 
    }
    getEnd(){
        return this.endDate;
    }
}