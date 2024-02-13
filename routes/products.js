const express = require('express');
const router = express.Router();
const fs = require('fs');

router.get('/', function(req, res) {
    const pageSize = 12;
    try {
        //get all products from Virtual Data Base with some JSON files
        let products = JSON.parse(fs.readFileSync("./public/data/products.json", 'utf-8'));
        //filter by category
        if (req.body.filtering.category)
            products = products.filter(item => item.category === req.body.filtering.category)
        //filter by price
        if (req.body.filtering.price){
            const allPrices = JSON.parse(fs.readFileSync("./public/data/prices.json", 'utf-8'));
            const myPrice = allPrices[req.body.filtering.price];
            products = products.filter(item => item.price >= myPrice.min && item.price <= myPrice.max);
        }
        //sorting
        if (req.body.filtering.sorting) {
            switch (req.body.filtering.sorting) {
                case 0: //price-up
                    products.sort((a, b) => a.price - b.price);
                    break;
                case 1: //price-down
                    products.sort((a, b) => b.price - a.price);
                    break;
                case 2: //new-first
                    products.sort((a, b) => new Date(b.date) - new Date(a.date));
                    break;
                case 3: //rating-up
                    products.sort((a, b) => a.rating - b.rating);
                    break;
                case 4: //rating-down
                    products.sort((a, b) => b.rating - a.rating);
                    break;
                default:
                    break;
            }
        }
        //select 12 products
        const startIndex = (req.body.page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const selectedProducts = products.slice(startIndex, endIndex);
        //send response
        res.json({ count: products.length, products: selectedProducts});
    } catch (error) {
        console.error("Error on *products/* controller:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;