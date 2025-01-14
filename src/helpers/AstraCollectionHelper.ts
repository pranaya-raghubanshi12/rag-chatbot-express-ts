import { Collection, DataAPIClient, SomeDoc } from "@datastax/astra-db-ts";
import "dotenv/config"
const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN
} = process.env;
type SimilarityMetric = "dot_product" | "cosine" | "euclidean";

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
let db = null;
if (ASTRA_DB_API_ENDPOINT !== undefined) {
    db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE })
}

const checkIfCollectionExists = async () => {
    if (!!!db || !!!ASTRA_DB_COLLECTION) return null;
    const collections = await db.listCollections();
    return collections && collections.find((col) => col.name === ASTRA_DB_COLLECTION) !== undefined;
}
export default {
    dbExists: () => (!!!db || !!!ASTRA_DB_COLLECTION) ? null : true,
    createCollection: async (similarityMetric: SimilarityMetric = "dot_product"): Promise<any> => {
        if (!!!db || !!!ASTRA_DB_COLLECTION) return null;
        const collectionExists = await checkIfCollectionExists();
        if (!collectionExists) {
            await db.createCollection(ASTRA_DB_COLLECTION, {
                vector: {
                    dimension: 1536,
                    metric: similarityMetric
                }
            });
        }
    },
    getCollection: async () : Promise<Collection<SomeDoc> | null> => {
        if (!!!db || !!!ASTRA_DB_COLLECTION) return null;
        const collection = await db.collection(ASTRA_DB_COLLECTION);
        return collection;
    }
}