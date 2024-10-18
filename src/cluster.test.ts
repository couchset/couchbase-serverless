import "mocha";
import "dotenv/config";
import { expect } from "chai";
import { Cluster } from "./cluster";

const keyTest = "test-key-cluster";
const valueTest = { description: "test description", id: keyTest, name: "test" };

const cbURL = process.env.COUCHBASE_URL || "couchbase://localhost";
const cbBucket = process.env.COUCHBASE_BUCKET || "dev";
const cbUsername = process.env.COUCHBASE_USERNAME || "admin";
const cbPw = process.env.COUCHBASE_PASSWORD || "1234";


describe("Cluster", () => {
    let cluster: Cluster;

    before(async () => {
        cluster = new Cluster(cbURL, {
            username: cbUsername,
            password: cbPw
        });

         await cluster.bucket(cbBucket).defaultCollection().upsert(keyTest, valueTest);

         await new Promise((resolve) => setTimeout(resolve, 500));
    });

    it("should query cluster", async () => {
        const createdDocument = await cluster.query(`SELECT * FROM ${cbBucket} WHERE id = '${keyTest}'`);

        expect(JSON.stringify(createdDocument.rows)).to.be.equal(JSON.stringify([{ [`${cbBucket}`]: valueTest}]));
    });

})