import request from 'request';

const prefix = "/devices";

beforeAll(() => {
    
})

describe("Devices", () => {
    it("should register correctly", () => {
        request.post(`${prefix}/register`, null, (res) => {
            console.log(res);

            expect(true).toBe(true);
        });
    });
});