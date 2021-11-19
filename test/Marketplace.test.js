const { assert } = require("chai");

const Marketplace = artifacts.require('./Marketplace.sol');

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Marketplace',([deployer,seller,buyer])=>{
    let marketplace;
    before(async ()=>{
        marketplace = await Marketplace.deployed();
    })
    describe('deployment',async ()=>{
        it('deploys succefully',async () => {
            const address = await marketplace.address;
            assert.notEqual(address,0x0);
            assert.notEqual(address,'');
            assert.notEqual(address,null);
            assert.notEqual(address,undefined);
        })

        it('has a Name',async () => {
            const name = await marketplace.name();
            assert.equal(name , 'Vinit Marketplace')
        })
    });



    describe('Products',async ()=>{

        let result,productCount;

        before(async ()=>{
            result = await marketplace.createProduct('Iphone 13' , web3.utils.toWei('1','Ether') , {from : seller});
            productCount = await marketplace.productCount();
        })
        it('Creates product',async () => {
            //SUCCESS
    assert.equal(productCount, 1);
    const event = result.logs[0].args;
    assert.equal(event.id.toNumber(),productCount.toNumber() , 'id is correct');
    assert.equal(event.name ,'Iphone 13' ,'name is correct');
    assert.equal(event.price,'1000000000000000000' ,'price is correct');
    assert.equal(event.owner,seller ,'is correct');
    assert.equal(event.purchased, false,'purchase is correct');


    //Failure : Product must have a Name
    await await marketplace.createProduct('' , web3.utils.toWei('1','Ether') , {from : seller}).should.be.rejected;
    await await marketplace.createProduct('Iphone 13' , 0 , {from : seller}).should.be.rejected;
    
        })

        it('Lists product',async () => {
            const products = await marketplace.products(productCount);
            assert.equal(products.id.toNumber(),productCount.toNumber() , 'id is correct');
            assert.equal(products.name ,'Iphone 13' ,'name is correct');
            assert.equal(products.price,'1000000000000000000' ,'price is correct');
            assert.equal(products.owner,seller ,'is correct');
            assert.equal(products.purchased, false,'purchase is correct');
    
        })
        
        it('Sells product',async () => {
            //SUCCESS : buyer makes purchase
            //Track the seller balance before purchase
            let oldSellerBalance;
            oldSellerBalance = await web3.eth.getBalance(seller);
            oldSellerBalance = new web3.utils.BN(oldSellerBalance);

           result = await marketplace.purchaseProduct(productCount , {from : buyer , value : web3.utils.toWei('1','Ether')} )
           //Check Logs
           const event = result.logs[0].args;
           assert.equal(event.id.toNumber(),productCount.toNumber() , 'id is correct');
           assert.equal(event.name ,'Iphone 13' ,'name is correct');
           assert.equal(event.price,'1000000000000000000' ,'price is correct');
           assert.equal(event.owner,buyer ,'is correct');
           assert.equal(event.purchased, true,'purchase is correct');

           //Check that seller received Funds
           let newSellerBalance ;
           newSellerBalance = await web3.eth.getBalance(seller);
           //newSellerBalance = new web3.utils.BN(newSellerBalance);

           let price
           price = web3.utils.toWei('1','Ether')
           price = new web3.utils.BN(price)
            const expectedBalance = oldSellerBalance.add(price)
            assert.equal(newSellerBalance.toString(),expectedBalance.toString());
        //Failure : Tries to buy a product that does Not exist
        await marketplace.purchaseProduct(99 , {from : buyer , value : web3.utils.toWei('1','Ether')}).should.be.rejected;
            //Failure  : Buyer tries to buy without enough ether
            await marketplace.purchaseProduct(productCount , {from : buyer , value : web3.utils.toWei('0.5','Ether')}).should.be.rejected;
            //Deployer tries to buy the Product
            await marketplace.purchaseProduct(productCount , {from : deployer , value : web3.utils.toWei('1','Ether')}).should.be.rejected;

        })



    });
})