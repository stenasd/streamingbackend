
var server = require('../../util.js');

let testjson = "\\\\ba\\\\ckt\\\\\\est"
describe("replacebackslash()", () => {
    it("should return 1", () => {
        expect(server.replaceAllBackSlash(testjson)).toEqual("backtest");
    });
});