const express = require( "express" ),
    app = express()

app.use(express.json());

app.use(express.static("public"));

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.USR}:${process.env.PASS}@${process.env.HOST}/?retryWrites=true&w=majority&appName=a3-OwenHart`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let collection = null;

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect(err => {
            console.log(err);
            client.close();
        });
        // Send a ping to confirm a successful connection
        await client.db("a3-db").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        collection = client.db("a3-db").collection("game-wishlist");
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
        //console.log("closed client");
    }
}

app.get("/appdata", async (req, res) => {
    if(collection !== null){
        const data = await collection.find({}).toArray();
        res.json(data);
    }
})

app.post( '/submit', async (req,res) => {
    const result = await collection.insertOne( req.body )
    res.json( result )
})

app.post('/remove', async (req,res) => {
    const removed = await collection.findOneAndDelete({name: req.body})
    res.json(removed)
})

run().catch(console.dir);

app.listen(process.env.PORT || 3000)