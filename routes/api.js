/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
// const request = require('request');
const StockLikeIPs = require('../models/StockLikeIPs');
const bent = require('bent');
const getJSON = bent('json');

const checkLikes = async (stock, ip, addLike) => {
	// This function should take a stock name and an ip address as arguments.
	// It should return the number of likes for the stock.
	// If the ip has already liked the stock, it should leave the data unchanged.
	// If the ip has not liked the stock before, it should.
	try {
		let stockDatabase = await StockLikeIPs.findOne({ name: stock });
		if (!stockDatabase && addLike) {
			// console.log('condition 1');
			let stockEntry = await new StockLikeIPs({
				name: stock,
				likeIPs: [ip]
			});
			await stockEntry.save();
			return 1;
		} else if (!stockDatabase && !addLike) {
			// console.log('condition 2');
			return 0;
		} else if (stockDatabase && !addLike) {
			// console.log('condition 3');
			return stockDatabase.likeIPs.length;
		} else if (stockDatabase && addLike) {
			// console.log('condition 4');
			if (stockDatabase.likeIPs.findIndex((elem) => elem === ip) === -1) {
				await stockDatabase.likeIPs.push(ip);
				let x = await stockDatabase.save();
				// console.log('saved database entry with updated ip');
				// console.log(x);
				return x.likeIPs.length;
			} else {
				return stockDatabase.likeIPs.length;
			}
		}
	} catch (e) {
		return console.log(e);
	}
};

const checkTwoStocks = async (input) => {
	if (Array.isArray(input.stock)) {
		return true;
	} else {
		return false;
	}
};

const checkValidStock = async (input) => {
	try {
		let check = await getJSON(`https://repeated-alpaca.glitch.me/v1/stock/${input}/quote`);
		if (check === 'Invalid symbol' || check === 'Unknown symbol') {
			return false;
		} else {
			return true;
		}
	} catch (e) {
		return console.log('ERROR:', e);
	}
};

module.exports = function(app) {
	app.route('/api/stock-prices').get(async (req, res) => {
		let like = req.query.like === 'true' ? true : false;
		let multipleStocks = await checkTwoStocks(req.query);
		if (multipleStocks) {
			let dataArray = [];
			for (let i in req.query.stock) {
				let valid = await checkValidStock(req.query.stock[0]);
				if (!valid) {
					res.json({
						error: 'Please input valid NASDAQ stock symbol'
					});
				}
				let data = await getJSON(`https://repeated-alpaca.glitch.me/v1/stock/${req.query.stock[i]}/quote`);
				let likes = await checkLikes(req.query.stock[i], req.connection.remoteAddress, like);
				dataArray.push({
					stock: data.symbol,
					price: data.latestPrice,
					likes
				});
			}
			let result = {
				stockData: [
					{
						stock: dataArray[0].stock,
						price: dataArray[0].price,
						rel_likes: dataArray[0].likes - dataArray[1].likes
					},
					{
						stock: dataArray[1].stock,
						price: dataArray[1].price,
						rel_likes: dataArray[1].likes - dataArray[0].likes
					}
				]
			};
			res.json(result);
		} else {
			try {
				let valid = await checkValidStock(req.query.stock);
				if (!valid) {
					res.json({
						error: 'Please input valid NASDAQ stock symbol'
					});
				}
				let data = await getJSON(`https://repeated-alpaca.glitch.me/v1/stock/${req.query.stock}/quote`);
				let likes = await checkLikes(req.query.stock, req.connection.remoteAddress, like);
				res.json({
					stockData: {
						stock: data.symbol,
						price: data.latestPrice,
						likes
					}
				});
			} catch (e) {
				return console.log(e);
			}
		}
	});
};
