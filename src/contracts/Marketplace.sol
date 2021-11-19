pragma solidity ^0.5.0;

contract Marketplace{
    string public name;
    uint public productCount = 0;
    mapping(uint => Product) public products;

    struct Product {
        uint id;
        string name;
        uint price;
        address payable owner;
        bool purchased;
    }

    event ProductCreated(
         uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    event ProductPurchased(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

constructor() public {
    name = "Vinit Marketplace";
}

    function createProduct(string memory _name , uint _price) public{
        // Make sure parameter are correct
        require(bytes(_name).length > 0);
        require(_price > 0);

        //Increment product count
        productCount++;
        //Create the products
        products[productCount] = Product(productCount,_name,_price,msg.sender,false);
        //Trigger an Event 
        emit ProductCreated(productCount,_name,_price,msg.sender,false);
    }
    

    function purchaseProduct(uint _id) public payable{
        //Fetch The product
        Product memory _product = products[_id];
        //fetch the owner
        address payable _seller = _product.owner;
        //Make Sure the product is has valid id
        require(_product.id > 0 && _product.id <=productCount);
        //Requirie that there is enough Ether in the transaction
        require(msg.value >= _product.price);
        //Require that the Product has not been Purchased already
        require(!_product.purchased);
        //require that the buyer is not the seller
        require(_seller != msg.sender);
        //Transfer Owner Ship
        _product.owner = msg.sender;
        //Mark as Purchased
        _product.purchased = true;
        //update the product in thew list
        products[_id] = _product;
        //Pay the seller by sending them ether
        address(_seller).transfer(msg.value);
        //Trigger an event
    emit ProductPurchased(productCount,_product.name,_product.price,msg.sender,true);
    }


}