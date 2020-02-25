/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

const StockLikeIPs = require('../models/StockLikeIPs');

chai.use(chaiHttp);

suite('Functional Tests', async () => {
	suite('GET /api/stock-prices => stockData object', () => {
		test('1 stock', function(done) {
			this.timeout(10000);
			chai.request(server)
				.get('/api/stock-prices/')
				.query({ stock: 'goog' })
				.end(async (err, res) => {
					if (err) {
						return console.log(err);
					}
					assert.equal(res.body.stockData.stock, 'GOOG');
					assert.property(res.body.stockData, 'price');
					assert.property(res.body.stockData, 'likes');
					done();
				});
		});
		test('1 stock with like', function(done) {
			this.timeout(10000);
			chai.request(server)
				.get('/api/stock-prices/')
				.query({ stock: 'fb', like: true })
				.end(async (err, res) => {
					if (err) {
						return console.log(err);
					}
					assert.equal(res.body.stockData.stock, 'FB');
					assert.property(res.body.stockData, 'price');
					assert.property(res.body.stockData, 'likes');
					done();
				});
		});
		test('1 stock with like again (ensure likes arent double counted)', function(done) {
			this.timeout(10000);
			chai.request(server)
				.get('/api/stock-prices/')
				.query({ stock: 'fb', like: true })
				.end((err, res) => {
					if (err) {
						return console.log(err);
					}
					assert.equal(res.body.stockData.stock, 'FB');
					assert.property(res.body.stockData, 'price');
					assert.property(res.body.stockData, 'likes');
					assert.equal(res.body.stockData.likes, 1);
					StockLikeIPs.deleteMany((err) => {
						if (err) {
							return console.log('error:', err);
						}
						chai.request(server)
							.get('/api/stock-prices')
							.query({ stock: 'fb', like: true })
							.end((err, res) => {
								if (err) {
									return console.log(err);
								}
								assert.equal(res.body.stockData.stock, 'FB');
								assert.property(res.body.stockData, 'price');
								assert.property(res.body.stockData, 'likes');
								assert.equal(res.body.stockData.likes, 1);
								done();
							});
					});
				});
		});
		test('2 stocks', function(done) {
			this.timeout(10000);
			chai.request(server)
				.get('/api/stock-prices/')
				.query({ stock: ['fb', 'goog'] })
				.end(async (err, res) => {
					if (err) {
						return console.log(err);
					}
					assert.equal(res.body.stockData[0].stock, 'FB');
					assert.property(res.body.stockData[0], 'price');
					assert.property(res.body.stockData[0], 'rel_likes');
					assert.equal(res.body.stockData[1].stock, 'GOOG');
					assert.property(res.body.stockData[1], 'price');
					assert.property(res.body.stockData[1], 'rel_likes');
					done();
				});
		});
		test('2 stocks with like', function(done) {
			this.timeout(10000);
			StockLikeIPs.deleteMany((err) => {
				if (err) {
					return console.log(err);
				}
				chai.request(server)
					.get('/api/stock-prices/')
					.query({ stock: 'goog', like: true })
					.end(async (err, res) => {
						if (err) {
							return console.log(err);
						}
						assert.equal(res.body.stockData.stock, 'GOOG');
						assert.property(res.body.stockData, 'price');
						assert.property(res.body.stockData, 'likes');
						chai.request(server)
							.get('/api/stock-prices/')
							.query({ stock: ['goog', 'fb'], like: true })
							.end((err, res) => {
								if (err) {
									return console.log(err);
								}
								assert.equal(res.body.stockData[0].stock, 'GOOG');
								assert.property(res.body.stockData[0], 'price');
								assert.property(res.body.stockData[0], 'rel_likes');
								assert.equal(res.body.stockData[0].rel_likes, 0);
								assert.equal(res.body.stockData[1].stock, 'FB');
								assert.property(res.body.stockData[1], 'price');
								assert.property(res.body.stockData[1], 'rel_likes');
								assert.equal(res.body.stockData[1].rel_likes, 0);
								done();
							});
					});
			});
		});
	});
});
