const express = require('express');
const router = express.Router();
const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');

//load input validation
const validateBook = require('../../validation/book');
const validateNewRetailerInput = require("../../validation/retailer");
const validateLoginInput = require("../../validation/login");


const Retailer = require('../../models/Retailer');
const Book = require('../../models/Book');


//@route POST api/store/createstore
//@desc Register user
//@access Public
router.post(`/store/createstore`, (req, res) => {
    //create a store

    const { errors, isValid } = validateNewRetailerInput(req.body);

    //check validation
    if(!isValid){
        return res.status(400).json(errors);
    }

    Retailer.findOne({ email: req.body.email }).then(retailer => {
        if(retailer) {
            return res.status(400).json({ email: "Email Already Exists" })
        } else {
            const newRetailer = new Retailer({
                storeName: req.body.storeName,
                userName: req.body.userName,
                email: req.body.email,
                password: req.body.password
            });

            bycrypt.genSalt(10, (err, salt) => {
                bycrypt.hash(newRetailer.password, salt, (err, hash) => {
                    if (err) throw (err);
                    newRetailer.password = hash;
                    newRetailer
                        .save()
                        .then(retailer => res.json(retailer))
                        .catch(err => console.log(err));
                });
            });
        }
    });
});

//login for store
router.post(`/store/login`, (req, res) => {
    //form validation

    console.log(req.body)
    const { errors, isValid } = validateLoginInput(req.body);
    console.log(req.body);


    //check validation
    if(!isValid) {
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    //find user by email
    Retailer.findOne({ email }).then(retailer => {
        //check if user exists
        if(!retailer) {
            res.status(404).json({ emailnotfound: "Email not found"
    })
        }

        //check password
        bycrypt.compare(password, retailer.password).then(isMatch => {
            if (isMatch) {
                //user matched
                //create JWT Payload
                const payload = {
                    id: retailer.id,
                    name: retailer.name
                };

                //sign token
                jwt.sign(
                    payload,
                    keys.secretOrKey,
                    {
                        expiresIn: 3155629236 //1 year in seconds
                    },
                    (err, token) => {
                        res.json({
                            success: true,
                            token: "Bearer " + token
                        });
                    }
                );
            } else {
                return res
                .status(400)
                .json({ passwordincorrect: "Password incorrect"});
            }
        });
    });
});




//get store info
router.get(`/store/:id`, async (req, res) => {
    try{
        const retailer = await Retailer.findById(req.params.id);
        if(!retailer){
            return res.status(400).send(`The store with id "${req.params.id}" does not exist...`);
        }
        return res.send(retailer);
    } catch (ex) {
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }
    

});

router.put(`/store/neworder/:id`, async (req, res) => {
    //here is where the function to add a new order to the orders array will go.
    try{    
        const id = req.params.id

        const result = await Retailer.findByIdAndUpdate(id, 
            { 
                $push: {

                    openOrders: req.body

                }
            }, {new: true}
        )
        
        res.send(result);
    } catch (ex) {
        console.log(ex);
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }

});

router.put(`/store/completedorder`, async (req, res) => {
    //this is where the function to add an existing order to the completed orders array will go
    //push to completed orders, pop from open orders
});

router.put(`/store/uncompleteorder`), async (req, res) => {
    //this is where the funciotn will go to move completed order back to open orders
    //push to open orders, pop from completed orders
}



//edit store info
router.put(`/store/update`, (req, res) => {

    Retailer.findByIdAndUpdate(
        req.params.id,

        //the change to be made. Mongoose will smartly combinde your existing document with this change which allows for partial updates too
        req.body,

        //an option that asks mongoose to run the updated version of the document instead of the pre-updated one
        {new: true},

        // the calback function
        (err, retailer) => {
            //handle any possible database errors
            if (err) return res.status.send(err);
            return res.send(retailer);
        }
    );

});

//create a product
router.post(`/store/newbook`, (req, res) => {

    try {
        const { error } = validateBook(req.body);
        if (error){
            console.log(error);
            return res.status(400).send(error);
        }

        const book = new Book({
            authors: req.body.authors,
            binding: req.body.binding,
            datePublished: req.body.datePublished,
            dimensions: req.body.dimensions,
            edition: req.body.edition,
            image: req.body.image,
            inventory: req.body.inventory,
            isbn: req.body.isbn,
            isbn13: req.body.isbn13,
            language: req.body.language,
            msrp: req.body.msrp,
            pages: req.body.pages,
            price: req.body.price,
            publisher: req.body.publisher,
            title: req.body.title,
            titleLong: req.body.titleLong,
            subjects: req.body.subjects,
            synopsis: req.body.synopsis

        });

        book.save();
        
        return res.send(book);

    } catch(ex) {
        console.log(ex);
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }

});

//get a list of ALL products
router.get(`/store/products/all`, async (req, res) =>{
    try{
        const books = await Book.find();
        return res.send(books); 
    } catch (ex) {
        console.log(ex);
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }
});

//get a list of product by id
router.get(`/store/products/:id`, async (req, res) => {

    try{ 

        const book = await Book.findById(req.params.id);

        if(!book){

            return res.status(400).send(`The product with id "${req.params.id}" does not exist`)
        }
        
        return res.send(book);
    } catch (ex) {
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }

});



//delete book by id
router.delete(`/store/products/delete/:id`, async (req, res) => {
    try{
        
        Book.deleteOne({_id: req.params.id}).then(
            () => {
                res.status(200).json({
                    message: 'Deleted!'
                });
            }
            )
            
        } catch (ex) {
            return res.status(500).send(`Internal Server Error: ${ex}`);
        }
});
    
router.put(`/store/products/increment/:id`, async (req, res) => {

    try {
        const id = req.params.id
        const increment = {
            $inc: {
                inventory: +1
            }
        }

        const result = await Book.findByIdAndUpdate(id, increment, { new: true })
        .then(() => {
            res.status(200).json({
                message: 'Book inventory was increased by one'
            });
        });

        res.send(result);

    } catch (ex) {
        console.log(ex);
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }

});

router.put(`/store/products/decrement/:id`, async (req, res) => {

    try {
        const id = req.params.id
        const increment = {
            $inc: {
                inventory: -1
            }
        }

        const result = await Book.findByIdAndUpdate(id, increment, { new: true })
        .then(() => {
            res.status(200).json({
                message: 'Book inventory was increased by one'
            });
        });

        res.send(result);

    } catch (ex) {
        console.log(ex);
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }

});


router.put(`/store/products/update/:id`, async (req, res) =>{
    try{

        const id = req.params.id;
        const updates = req.body;

        const result = await Book.findByIdAndUpdate(id, updates, {new: true})
        .then(() => {
            res.status(200).json({
                message: `${updates.title} was updated in the database!`
            });
        });

        res.send(result);


    } catch (ex) {
        console.log(ex);
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }
});

module.exports = router;