import "mocha";
import { expect } from "chai";
import { Cluster } from "./cluster";

const keyTest = "test-key-cluster";
const valueTest = { description: "test description", id: keyTest, name: "test" };
const bucketName = "stq";

describe("Cluster", () => {
    let cluster: Cluster;

    before(async () => {
        cluster = await Cluster.connect("couchbase://localhost", {
            username: "admin",
            password: "1234567"
        });

         await cluster.bucket(bucketName).defaultCollection().upsert(keyTest, valueTest);

         await new Promise((resolve) => setTimeout(resolve, 500));
    });

    it("should query cluster", async () => {
        const createdDocument = await cluster.query(`SELECT * FROM ${bucketName} WHERE id = '${keyTest}'`);

        expect(JSON.stringify(createdDocument.rows)).to.be.equal(JSON.stringify([{ [`${bucketName}`]: valueTest}]));
    });

})