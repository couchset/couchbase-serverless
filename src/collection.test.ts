import "mocha";
import { expect } from "chai";
import { Cluster } from "./cluster";
import { Collection } from "./collection";

const keyTest = "test-key";
const expireKey = "expire-key" + keyTest;
const valueTest = { description: "test description", id: keyTest, name: "test" };
const valueTestExpire = { description: "test description", id: expireKey, name: "test" };
const bucketName = "stq";

describe("Collection", () => {
    let cluster: Cluster;
    let collection: Collection;

    before(async () => {
        cluster = await Cluster.connect("couchbase://localhost", {
            username: "admin",
            password: "1234567"
        });
        collection = cluster.bucket(bucketName).defaultCollection();
    });

    it("should upsert a document into collection", async () => {
        const createdDocument = await collection.upsert(keyTest, valueTest);

        console.log("createdDocument", createdDocument);

        await new Promise((resolve) => setTimeout(resolve, 500));

        expect(JSON.stringify(createdDocument.content)).to.be.equal(JSON.stringify(valueTest));
    });

    it("should get a document from collection", async () => {
        const createdDocument = await collection.get(keyTest, { project: ["*"] });

        expect(JSON.stringify(createdDocument.content[bucketName])).to.be.equal(JSON.stringify(valueTest));
    });

    it("should get a document from collection with projected keys", async () => {
        const createdDocument = await collection.get(keyTest, { project: ["description", "id", "name"] });

        expect(JSON.stringify(createdDocument.content)).to.be.equal(JSON.stringify(valueTest));
    });

    it("should upsert a document into collection with expiry", async () => {
       
        const createdDocument = await collection.upsert(expireKey, valueTestExpire, { expiry: 10 });

        console.log("createdDocument expire document", createdDocument);

        expect(JSON.stringify(createdDocument.content)).to.be.equal(JSON.stringify(valueTestExpire));
    });

    it("should remove a document from collection", async () => {
        const removedDocument = await collection.remove([expireKey, keyTest]);
        console.log("removedDocument", removedDocument);
        expect(JSON.stringify(removedDocument.content)).to.be.equal(JSON.stringify(valueTestExpire));
    });



})