const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 3000
// console.log(process.env);

// middleware
app.use(cors())
app.use(express.json())


// URI
const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_pass}@cluster0.zbtu92j.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function run() {
    try {

        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const db = client.db('smart_db')
        const productsCollection = db.collection('products')
        const bidsCollection = db.collection('bids')
        const usersCollection=db.collection('users')


        // users Apis
        app.post('/users',async(req,res)=>{
            const newUser=req.body
            const email=req.body.email
            const query={email:email}
            const existingUser=await usersCollection.findOne(query)
            if(existingUser){
                res.send({message:'User Already Exist'})
            }else{
            const result=await usersCollection.insertOne(newUser)
            res.send(result)
            }
        })

        app.get('/users',async(req,res)=>{
            // const email=req.body.email
            const email = req.query?.email || req.body?.email || null;
            const query={}
            if(email){
                query.email=email
            }
            const cursor=usersCollection.find(query)
            const result=await cursor.toArray()
            res.send(result)
        })


        // products Apis
        // find All
        app.get('/products', async (req, res) => {
            // const projectField={title:1,status:1}
            // const cursor=productsCollection.find().sort({price_min:-1}).skip(2).limit(6).project(projectField)
            // console.log(req.query);
            const email = req.query.email
            const query = {}
            if (email) {
                query.email = email
            }

            const cursor = productsCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })
        
        // latest-products sort
        app.get('/latest-products',async(req,res)=>{
            const cursor=await productsCollection.find().sort({created_at:-1}).limit(6)
            const result=await cursor.toArray()
            res.send(result)
        })

        // find Specific one
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id
            // const query = { _id: new ObjectId(id) }
            let query
            if (ObjectId.isValid(id)) {
                query = { _id: new ObjectId(id) }
            } else {
                query = { _id: id }
            }
            const result = await productsCollection.findOne(query)
            res.send(result)
        })

        // post
        app.post('/products', async (req, res) => {
            const newProduct = req.body
            const result = await productsCollection.insertOne(newProduct)
            res.send(result)
        })

        // update
        app.patch('/products/:id', async (req, res) => {
            const id = req.params.id
            const updatedProduct = req.body;
            const query = { _id: new ObjectId(id) }
            // if you can all data update
            // const update={$set:updatedProduct}

            // specific data update
            const update = {
                $set: {
                    name: updatedProduct.name,
                    price: updatedProduct.price
                }
            }
            const result = await productsCollection.updateOne(query, update)
            res.send(result)
        })

        // delete
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await productsCollection.deleteOne(query)
            res.send(result)
        })


        // bids Apis
        app.get('/bids', async (req, res) => {
            const email = req.query.email
            const query = {}
            if (email) {
                query.buyer_email = email
            }
            const cursor = bidsCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/products/bids/:productId',async(req,res)=>{
            const productId=req.params.productId
            const query={product:productId}
            const cursor=bidsCollection.find(query).sort({bid_price:-1})
            const result=await cursor.toArray()
            res.send(result)
        })

        // account count bids
        app.get('/bids',async(req,res)=>{
            const query={}
            if(query.email){
                query.buyer_email=email
            }
            const cursor=bidsCollection.find(query).sort({bid_price:-1})
            const result=await cursor.toArray()
            res.send(result)
        })

        // bids delete
        app.delete('/bids/:id',async(req,res)=>{
            const id=req.params.id
            const query={_id:new ObjectId(id)}
            const result=await bidsCollection.deleteOne(query)
            res.send(result)
        })

        app.get('/bids/:id', async (req, res) => {
            const id = req.params.id
            // console.log(id);

            // const query={_id:id}
            let query
            if (ObjectId.isValid(id)) {
                query = { _id: new ObjectId(id) }
            } else {
                query = { _id: id }
            }
            const result = await bidsCollection.findOne(query)
            // console.log();
            
            res.send(result)
        })

        app.post('/bids', async (req, res) => {
            const newBid = req.body
            const result = await bidsCollection.insertOne(newBid)
            res.send(result)
        })



        app.get('/', (req, res) => {
            res.send('Smart Deal Server Is Running')
        })
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log(`Server Running on Port:${port}`);
})