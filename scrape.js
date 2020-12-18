const puppeteer = require('puppeteer');
const datafile = require('fs');
const CREDS = require('./creds');
const HashTable = require('./HashTable.js');


//create the Hash Table object for storing the data once it is retrieved
//from the webpage
const theHashTable = new HashTable()

async function run(){

//Open required files for storing data and logging 
datafile.open('theData.txt', 'w', function(err, f){
    
})
datafile.open('Duplicates.txt', 'w', function(err, f){
    
})
datafile.open('Errors.txt', 'w', function(err, f){
    
})

var count = 0; //keeps track of the index when looping through the 'to' 'from' and 'streetname' arrays in CREDS.js

const tempInfo = 'X' //A temporary value to store in the hashtable when first hashing a parcel number

while(count <= CREDS.streetname.length){
    //launch puppeteer and connect to accesskent.com
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('https://www.accesskent.com/Property/search.do');
    await page.waitForSelector('#addressNoS');
    
    //Get Selectors for input
    const FROM_SELECTOR = '#addressNoS'; //Selector for start range input field
    const TO_SELECTOR = '#addressNoE';  //Selector for end range input field
    const STREET_NAME = '#sreetNameField'; //Selector for street name input field
    const SELECT_BTN = '#PropSearch > div.row > div:nth-child(1) > fieldset > div:nth-child(5) > div > input'; //Selector for the search button 

    //Fill out the search criteria
    await page.click(FROM_SELECTOR);
    await page.keyboard.type(CREDS.from[count]);
    
    await page.click(TO_SELECTOR);
    await page.keyboard.type(CREDS.to[count]);
    
    await page.click(STREET_NAME);
    await page.keyboard.type(CREDS.streetname[count]);

    await page.click(SELECT_BTN);
    
    try{
        await page.waitForSelector('body > div.off-canvas-wrapper > div > div.row.apps.main-content > div > form > table > tbody > tr:nth-child(1) > td:nth-child(2) > a', {timeout: 3000});
        
        await page.focus('body > div.off-canvas-wrapper > div > div.row.apps.main-content > div > form > table');
        
        await page.waitForSelector('body > div.off-canvas-wrapper > div > div.row.apps.main-content > div > form > div.row.pagniation > div.large-5.medium-4.columns.text-center.medium-text-left > input:nth-child(2)');
        
        const FULL_PAGE = 'body > div.off-canvas-wrapper > div > div.row.apps.main-content > div > form > div.row.pagniation > div.large-5.medium-4.columns.text-center.medium-text-left > input:nth-child(2)';
        page.click(FULL_PAGE);
    }catch{
        //Address range did not return any parcel numbers. Go to next street name + address range
        console.log("bitch")
        count+=1
        continue
    }
    //await delay(1500);
    await page.waitForNavigation()
    //Grab all of the parcel number links and store them inside of hrefs
    let hrefs = await page.$$eval('body > div.off-canvas-wrapper > div > div.row.apps.main-content > div > form > table > tbody > tr > td > a ', as => as.map(a => a.href));
    let parcelLinks = await page.$$('body > div.off-canvas-wrapper > div > div.row.apps.main-content > div > form > table > tbody > tr > td > a');

    //Get the text value from each of the parcel number links (need them for hashing)
    let parcelNumbers = new Array()
    k = hrefs.length;
    while(k--){
        
            let parcelText = await parcelLinks[k].getProperty('innerText')
            let theNumber = await parcelText.jsonValue()
            
            //Check that the link text is actually a parcel number.
            if(parseInt(theNumber.toString().replace(/-/g, "")) == undefined || isNaN(parseInt(theNumber.toString().replace(/-/g, "")))){
            //remove the link from the list if it is not a parcel number
               hrefs.splice(k,1)  
            }else{
                
                parcelNumbers.push(parseInt(theNumber.toString().replace(/-/g, "")))
                
            }   
    }
    
    let pi = hrefs.length-1
    hrefsCounter:
    for (let i = 0; i < hrefs.length; i++) {
        const url = hrefs[i]
    
        const used = process.memoryUsage().heapUsed / 1024 / 1024;
        console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
    
        //ADD PARCEL NUMBER/TEMP INFO TO HASH TABLE
        if(theHashTable.set(parcelNumbers[pi], tempInfo) != 1){
            console.log("this parcel number has already been added. Going to next")
            continue hrefsCounter
        }
        
        //try to step into the parcel number link. jump back to top of loop if page not found
        try{
            await page.goto(`${url}`);
            await page.waitForSelector('#parcel-nav > ul > li:nth-child(6) > a',{timeout: 2000});
            var DELINQUENT_STATUS = ('#parcel-nav > ul > li:nth-child(6) > a');  
            //get the property info from the first page afer stepping into the parcel number link
            var propertyInfo = await page.evaluate(()=>{
                var textblock = Array.from(document.querySelectorAll('body > div.off-canvas-wrapper > div > div.row.apps.main-content > div > form > fieldset > div > div:nth-child(1) > p'));
                return textblock.map(p => p.innerText.replace(/^\s+|\s+$/g, '').trim());
            })
            //step into the delinquent tab to get tax money owed
            await page.click(DELINQUENT_STATUS);
        }catch{
            pi--
            continue
        }
  
        
        try{
            await page.waitForSelector('body > div.off-canvas-wrapper > div > div.row.apps.main-content > div > form > fieldset > table > tbody > tr > td:nth-child(2)');
            var data = await page.evaluate(()=>{
                var tds = Array.from(document.querySelectorAll('td:nth-child(3)'));
                return tds.map(td => td.innerText.replace(/^\s+|\s+$/g, '').trim());
            })
        }catch{

            datafile.appendFile('Errors.txt', parcelNumber[pi], (err) => {
                if(err) throw err;
            })

            var data = '$0.00'
        }
    
        //Combine the data from the delinquent tab with the property info
        var allData = propertyInfo
        allData.push(data + '>>\n')
    
        //Send parcel number as key and the data as value to the hash table
        theHashTable.set(parcelNumbers[pi], allData)
        --pi
    }
    
    
    //All data gathered from the links on this page are written to theData.txt file
    dataCounter = 0
    //overwrite the previous data
    datafile.writeFile('theData.txt', 'Sean Thompson\n', (err) => {
        if(err) throw err;
    })
    for(let j = 0; j < theHashTable.size; j++){
        if(typeof theHashTable.buckets[j] != 'undefined'){
            nodeData = theHashTable.buckets[j].tail
            datafile.appendFile('theData.txt',  nodeData.data, (err) => {
                if(err) throw err;
            })
            dataCounter += 1
           
            nodeData = nodeData.next
            while(nodeData != null){
                datafile.appendFile('theData.txt', nodeData.data, (err) => {
                    if(err) throw err;
                })
                
                dataCounter += 1
                nodeData = nodeData.next
            }
        }
    }

    console.log(dataCounter)
    console.log("finished page", count)
    await browser.close()
    count+=1

}


delay(3000)
}

function delay(time) {
   return new Promise(function(resolve) { 
       setTimeout(resolve, time)
   });
}

run();

