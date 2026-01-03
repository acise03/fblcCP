export class Poll {
    private votes = {};
    private comments = [];
    private id: string = "1";

    constructor(private text: string, private date: Date, private business: string, private options: string[]) {
        options.map((option) => {
            this.votes = {...this.votes, [option]: 0}
        })
    }

    getPoll() {
        return { id: this.id, text: this.text, date: this.date, business: this.business, votes: this.votes, comments: this.comments }
    }
}