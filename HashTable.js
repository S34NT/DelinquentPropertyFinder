const LL = require('./LinkedList') //Importing LinkedList Class
const Node = require('./NodesClass') //Importing Nodes Class
const datafile = require('fs') //Importing file object


    //Hashtable constructor sets size of hashtable to a prime number
    //that is closest to half the number of all properties in Kent County
    class HashTable{
        constructor(size = 80021){
            this.buckets = new Array(size)
            this.size = size  
            console.log("HashTable Constructed")
        }
    
        
        hash(key){
            let index = key % this.size //Hashed value is the parcel number -modulus- the size of the table
            return(index)
        }
    
        //Setter method for adding values to the hash table
        set(key, value){
    
            let oneList = new LL()
            let oneNode = new Node(key, value)
            oneList.addNode(oneNode)
            let index = this.hash(key);
            console.log("hash index produced:", index)
    
            //Check if array position is valid and available
            if(!this.buckets[index] || typeof this.buckets[index] == 'undefined'){
                this.buckets[index] = []
                this.buckets[index] = oneList
                console.log("hashed parcel number:", this.buckets[index].tail.key, "\n")
                return(1)
            }else{
                
                //Check if current value is temp value (overwrite temp value)
                if(this.buckets[index].tail.key == key && this.buckets[index].tail.data == 'X'){
                    this.buckets[index] = oneList
                    console.log("overwriting previous temp info for: ", this.buckets[index].tail.key, "\n")
                    return(1)
    
                //current value is not temp value. check if it's a duplicate 
                }else if(this.buckets[index].tail.key == key && this.buckets[index].tail.data != 'X'){
                    console.log(this.buckets[index].tail.data)
                    datafile.appendFile('Duplicates.txt', key, (err) => {
                        if(err) throw err;
                    })
                    return(0)
    
                }else{
                    //not a duplicate or temp, check the linked list for the value
                    let checkNode = this.buckets[index].tail.next
                    let position = 1
                    while(checkNode != null){
                        if(checkNode.key == key && checkNode.data == 'X'){
                            this.buckets[index].replaceNode(oneNode, position, this.buckets[index])
                            return(1)
                        }
    
                        if(checkNode.key == key && checkNode.data != 'X'){
                            datafile.appendFile('Duplicates.txt', key, (err) => {
                                if(err) throw err;
                            })
                            console.log(checkNode.key, " has been marked as a duplicate\n")
                        }
                        position++
                        checkNode = checkNode.next 
                    }
                    this.buckets[index].addNode(oneNode)
                    console.log("extending linked list at position ", index, "with node ", this.buckets[index].tail.key)
                }
            }    
           
            }
            
        //Getter method for retrieving values from the hashtable 
        get(key){
            
            let index = hash(key)
    
            theList = this.buckets[index]
    
            while(theList.nextNode != null){
                
            } 
               
        }
        
    }

    //Make hashtable available to other classes
    module.exports = HashTable;

