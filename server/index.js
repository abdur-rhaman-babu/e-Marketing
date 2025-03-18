require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const morgan = require("morgan");

const port = process.env.PORT || 9000;
const app = express();
// middleware
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6avkk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    const db = client.db("e-marketing");
    const userCollections = db.collection("users");
    const productCollections = db.collection("products");
    const ordersCollections = db.collection("orders");

    // save or update user
    app.post("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = req.body;
      // check if user exist in db
      const isExist = await userCollections.findOne(query);
      if (isExist) {
        return res.send(isExist);
      }
      const result = await userCollections.insertOne({
        ...user,
        role: "customer",
        timestamp: Date.now(),
      });
      res.send(result);
    });

    // save product in db
    app.post("/product", verifyToken, async (req, res) => {
      const product = req.body;
      const result = await productCollections.insertOne(product);
      res.send(result);
    });

    // get product from db
    app.get("/products", async (req, res) => {
      const result = await productCollections.find().toArray();
      res.send(result);
    });

    // get product using Id
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollections.findOne(query);
      res.send(result);
    });

    // save purchase data in db
    app.post("/orders", verifyToken, async (req, res) => {
      const order = req.body;
      const result = await ordersCollections.insertOne(order);
      res.send(result);
    });

    // update quantity when increase quantity

    app.patch("/product/quantity/:id", verifyToken, async (req, res) => {
      try {
        const id = req.params.id;
        const { quantityToUpdate, status } = req.body;
        const filter = { _id: new ObjectId(id) };

        let updateDoc;
        if (status === "increase") {
          updateDoc = { $inc: { quantity: quantityToUpdate } };
        } else {
          updateDoc = { $inc: { quantity: -quantityToUpdate } };
        }

        const result = await productCollections.updateOne(filter, updateDoc);
        res.send(result);
      } catch (error) {
        console.error("Error updating quantity:", error);
        res.status(500).send({ error: "Internal Server Error" });
      }
    });

    // get order data with specific email
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      const result = await ordersCollections
        .aggregate([
          {
            $match: { "customer.email": email },
          },
          {
            $addFields: {
              productId: { $toObjectId: "$productId" },
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "productId",
              foreignField: "_id",
              as: "products",
            },
          },
          { $unwind: "$products" },
          {
            $addFields: {
              name: "$products.name",
              category: "$products.category",
              image: "$products.image",
            },
          },
          {
            $project: {
              products: 0,
            },
          },
        ])
        .toArray();
      res.send(result);
    });

    // delete data from order
    app.delete("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const order = await ordersCollections.findOne(query);
      if (order.status === "Delivered")
        return res
          .status(409)
          .send("Cannot cancel once the product is delivered");
      const result = await ordersCollections.deleteOne(query);
      res.send(result);
    });

    // manage user status
    app.patch("/user/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollections.findOne(query);
      if (!user || user?.status === "Requested")
        return res
          .status(400)
          .send("You have already requested wait for some time");

      const updatedDoc = {
        $set: {
          status: "Requested",
        },
      };
      const result = await userCollections.updateOne(query, updatedDoc);
      res.send(result);
    });

    // Generate jwt token
    app.post("/jwt", async (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "365d",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });
    // Logout
    app.get("/logout", async (req, res) => {
      try {
        res
          .clearCookie("token", {
            maxAge: 0,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          })
          .send({ success: true });
      } catch (err) {
        res.status(500).send(err);
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from plantNet Server..");
});

app.listen(port, () => {
  console.log(`plantNet is running on port ${port}`);
});
