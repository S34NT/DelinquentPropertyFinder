
//Node class constructor takes key(parcel number) and value(property info)
class Node{
    constructor(key, data){
        this.key = key
        this.data = data
        this.nextNode = null
    }   
}


//Make node class available to other classes
module.exports = Node;