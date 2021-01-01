# DelinquentPropertyFinder
Pulls data from public records to find tax delinquent property in Kent County

## Run the webscraper
To Run this application:

1. Clone the repository to your local machine
2. From the command line, navigate to the project directory and then run npm install (this will install the node_modules folder which will contain puppeteer, chromium, and all other required dependancies)
3. From inside the project directory, run the command 'Node scrape.js' to run the program.


## Motivation

  The reason I decided to make this web scraper is because I wanted to create a better and cheaper way for local real estate investors to get access to the Delinquent Tax List. If you are not familiar with the Delinquent Tax List, it is the list of addresses in a County that have not been paying property taxes. These particular addresses can be used by investors to help them more easily identify property owners that could potentially be at risk of being foreclosed on. 
  By making this information more accessible, investors are better able to reach out and help these at risk properties by paying off their debt to the state and purchasing the property at a discounted price. However, to buy this list from the County Treasurer it will cost you .25 cents per parcel number. Currently that adds up to just over $1000 for the list. So, in order to avoid paying that price myself and to lower the price for others I decided that I would assemble the list myself.
  By referencing the Kent County Street Directory (which lists every street name and address ranges for every street) I am able to search every listed address on every street in Kent County by plugging that data into the property search tool, which is available on the Official County Website. 
