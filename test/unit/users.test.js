let movarray = { "movarr": [{ "id": "5", "time": "6" }] }
let reqbod = {"id":"1","time":"2"}
let shouldbe = { "movarr": [{"id":"1","time":"2"},{ "id": "5", "time": "6" }] }
var db = require('../../db');

describe("userjsonformer", () => {
    it("should return appended", () => {
        expect(db.users.jsonpostformater(reqbod,movarray)).toEqual(shouldbe);
    });
});