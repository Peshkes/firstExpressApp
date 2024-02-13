const express = require('express');
const router = express.Router();
const fs = require('fs');

router.get('/', function (req, res) {
    const decodedParams = decodeURIComponent(req.query.params);
    const params = JSON.parse(decodedParams);
    console.log(params);
    const pageSize = 12;
    let count;
    try {
        //get all products from Virtual Data Base with some JSON files
        let products = JSON.parse(fs.readFileSync("./public/data/products.json", 'utf-8'));
        //filter by category
        if (params.filtering.category)
            products = products.filter(item => item.category === params.filtering.category)
        //filter by price
        if (params.filtering.price) {
            const allPrices = JSON.parse(fs.readFileSync("./public/data/prices.json", 'utf-8'));
            const myPrice = allPrices[params.filtering.price];
            products = products.filter(item => item.price >= myPrice.min && item.price <= myPrice.max);
        }
        //sorting
        if (params.filtering.sorting) {
            switch (params.filtering.sorting) {
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
        count = products.length;
        //select 12 products if not null
        //if page === null then it was getAll request
        if (params.page != null) {
            const startIndex = (params.page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            products = products.slice(startIndex, endIndex);
        }
        //send response
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.json({count, products});
    } catch (error) {
        console.error("Error on *products/* controller:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
});

module.exports = router;