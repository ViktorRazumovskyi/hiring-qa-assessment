import Server, { server } from "../server";
import * as supertest from "supertest";
import fetch from "node-fetch";
import { V1_API_DOMAIN } from "../constants";
export const testServer = supertest(Server);

jest.mock("node-fetch");
describe("Protected endpoint", () => {
    afterAll(() => {
        jest.clearAllMocks();
    });

    it("Succeed", async () => {
        expect.assertions(2);

        const responseV1Middleware = { response: "Ok" };
        const responseV1Protected = { response: "Ok in Protected call" };

        fetch.mockResolvedValueOnce({
            json: () => Promise.resolve(responseV1Middleware),
            status: 200,
        });
        fetch.mockResolvedValueOnce({
            json: () => Promise.resolve(responseV1Protected),
            status: 200,
        });

        const response = await testServer
            .post(`/v3/protected`)
            .send({
                operation: "SEND",
                count: 12,
                text: "fsdfsdf",
            })
            .set("Content-type", "application/json");

        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual(responseV1Protected);
    });
    it("Succeed with maxed allowed text value length 4096 characters", async () => {
        expect.assertions(2);

        const longText = [...Array(4096).fill("s")].join("");

        const responseV1Middleware = { response: "Ok" };
        const responseV1Protected = { response: "Ok in Protected call" };

        fetch.mockResolvedValueOnce({
            json: () => Promise.resolve(responseV1Middleware),
            status: 200,
        });
        fetch.mockResolvedValueOnce({
            json: () => Promise.resolve(responseV1Protected),
            status: 200,
        });

        const response = await testServer
            .post(`/v3/protected`)
            .send({
                operation: "SEND",
                count: 12,
                text: longText,
            })
            .set("Content-type", "application/json");

        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual(responseV1Protected);
    });
    it("Authorization failed by middleware", async () => {
        expect.assertions(2);

        fetch.mockResolvedValueOnce({
            status: 401,
        });
        fetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ response: "Ok" }),
            status: 200,
        });

        const response = await testServer
            .post(`/v3/protected`)
            .send({
                operation: "SEND",
                count: 12,
                text: "fsdfsdf",
            })
            .set("Content-type", "application/json");
        console.log(response.status, "status");

        expect(response.status).toBe(401);
        // To verify that url is from middleware not from protected controller V1 api
        expect(fetch).toHaveBeenCalledWith(`${V1_API_DOMAIN}/v1/auth/validate`, {
            headers: undefined,
        });
    });
    it("500 response code - Text value length is too long", async () => {
        expect.assertions(1);

        const tooLongText = [...Array(4097).fill("s")].join("");

        const responseV1Middleware = { response: "Ok" };
        const responseV1Protected = { response: "Ok in Protected call" };

        fetch.mockResolvedValueOnce({
            json: () => Promise.resolve(responseV1Middleware),
            status: 200,
        });
        fetch.mockResolvedValueOnce({
            json: () => Promise.resolve(responseV1Protected),
            status: 200,
        });

        const response = await testServer
            .post(`/v3/protected`)
            .send({
                operation: "SEND",
                count: 12,
                text: tooLongText,
            })
            .set("Content-type", "application/json");

        expect(response.status).toBe(500);
    });
});

afterAll(() => {
    server.close();
});
