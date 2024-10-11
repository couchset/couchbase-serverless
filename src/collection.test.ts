import "mocha";
import { expect } from "chai";
import { Cluster } from "./cluster";
import { Collection } from "./collection";

const keyTest = "test-key";
const valueTest = { description: "test description", id: keyTest, name: "test" };
const bucketName = "stq";

describe("Collection", () => {
    let cluster: Cluster;
    let collection: Collection;

    before(async () => {
        cluster = await Cluster.connect( "couchbase://localhost", {
            username: "admin",
            password: "1234567"
        });
        collection = cluster.bucket(bucketName).defaultCollection();
    });

    it("should upsert a document into collection", async () => {
        const createdDocument = await collection.upsert(keyTest, valueTest);

        console.log("createdDocument", createdDocument);

        expect(JSON.stringify(createdDocument)).to.be.equal(JSON.stringify(valueTest));
    }); 

    it("should get a document from collection", async () => {
        const createdDocument = await collection.get(keyTest, { project: ["*"] });

        expect(JSON.stringify(createdDocument[bucketName])).to.be.equal(JSON.stringify(valueTest));
    }); 

    it("should get a document from collection with projected keys", async () => {
        const createdDocument = await collection.get(keyTest, { project: ["description", "id", "name"] });

        expect(JSON.stringify(createdDocument)).to.be.equal(JSON.stringify(valueTest));
    }); 

})