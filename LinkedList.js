
//Linked List class constructor
//For this LinkedList implementation, Head = Last node in the list
                                    //Tail = First node in the list
class LinkedList{
    constructor(){
        this.head = null
        this.tail = null
        this.size = 0
        console.log("LinkedList Constructed")
    }

    //Function for adding a node to a linked list
    addNode(node){

        var current

        if(this.head == null){
            this.head = node
            this.tail = node
        }else{
            current = this.tail

            while(current.next){
                current = current.next
            }

            current.next = node
            this.head = node
        }
        this.size++
    }


    //Function for replacing a node at any position in a linked list
    replaceNode(oneNode, position, oneList){

        //If position is the last position (head node) set oneNode as the head node
        if(position == oneList.size){
            oneList.head = oneNode

        //If position is the first position (tail node) replace the tail node with oneNode
        }else if(position == 0){
            oneNode.next = oneList.tail.next
            oneList.tail.next = null
            oneList.tail = oneNode

        }else{

            var current = oneList.tail
            var prev = null
            //Find the referenced node in the list by its 'position' value
            for(let i = 0; i < position; i++){
                prev = current
                current = current.next
            }
    
            //Replace the node 
            prev.next = oneNode
            oneNode.next = current.next
            current.next = null

        }

    }
    
}


//Make LinkedList Class available to other classes
module.exports = LinkedList;