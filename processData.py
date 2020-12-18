import mysql.connector
from mysql.connector import Error
from mysql.connector import errorcode

def readData():
	counter = 0
	dataFields = {} #dataFields will contain every field for a single row
	tempFields = "" #tempFields is used to create the last two fields
	with open('theData.txt', 'r') as file:

		#Loop through the file and process it 7 lines at a time
		while True:
  
  			#Every 7 lines in the file is a single row to be sent to the database
			for x in range(0, 7):
			   #Read a line from the file and send it to clean()
				oneLine = file.readline()
				if not oneLine:
					return
			   

				oneLine = clean(oneLine, x)

				   #For every line except for the last, store the value returned from
				   #the clean() function inside the dataFields dictionary
				if(x != 6):
					if(x == 3 and oneLine == ""):
						oneLine = "None"
					dataFields[x] = oneLine.rstrip("\n")
				else:
				    tempFields = oneLine.rstrip("\n")

			#For the last line, split the string returned from clean() on the newline char
			sep = '\n'
			district = tempFields.split(sep, 1)[0]
			taxOwed = tempFields.split(sep, 1)[1]

			#Add the district to the dictionary
			dataFields[6] = district
			
			taxOwedAndYearsDelinquent = findYearsTotal(taxOwed)
			dataFields[7] = str(taxOwedAndYearsDelinquent[0])
			dataFields[8] = str(taxOwedAndYearsDelinquent[1])
            

            #sendtoDB method takes the datafields dictionary as an argument
			sendToDB(dataFields)


#FindYearsTotal takes the taxOwed String and
def findYearsTotal(taxOwed):
	count = 0
	for x in taxOwed:
		if(x == '$'):
			if('$0.00' not in taxOwed):
				count+=1
	if(count == 1):
		taxOwed = taxOwed.replace(",","")
		taxOwed = taxOwed.lstrip("$")
		return (float(taxOwed), count)
	else:
		taxDefaults = taxOwed.split(",$")
		taxDefaults[0] = taxDefaults[0].lstrip("$")
		taxDefaultsTotal = 0.0
		for i in range(0, len(taxDefaults)):
			taxDefaultsTotal += float(taxDefaults[i].replace(",",""))


		
		return (taxDefaultsTotal, count)

		
def clean(oneLine, index):
    #Find the index of the first colon char and remove it
    #Along with every other character to the left
	idx = oneLine.find(":") + 1
	oneLine = oneLine[idx:].lstrip()

    #If this line is the last line, set index to the first '$' char
	if(index == 6):
		idx = oneLine.find("$")
        
        #taxOwed is set to  the right hand portion of the string
		taxOwed = oneLine[idx:].rstrip(",> \n")
        #district is set to the left hand portion of the string
		district = oneLine[:idx].rstrip(",")
        
		return(district + '\n' + taxOwed)

	return oneLine


def sendToDB(dataFields):
	
	try:
		connection = mysql.connector.connect(host='localhost',
	                                         database='housingGR2',
	                                         user='root',
	                                         password='GeneticSP1')

		dataFields['ParcelNumber'] = dataFields.pop(0)
		dataFields["GovernmentUnit"] = dataFields.pop(1)
		dataFields["Owner1"] = dataFields.pop(2)
		dataFields["Owner2"] = dataFields.pop(3)
		dataFields["Address"] = dataFields.pop(4)
		dataFields["Classification"] = dataFields.pop(5)
		dataFields["District"] = dataFields.pop(6)
		dataFields["taxOwed"] = dataFields.pop(7)
		dataFields["years"] = dataFields.pop(8)

		
		columns = ', '.join("`" + str(x).replace('/', '_') + "`" for x in dataFields.keys())
		values = ', '.join("'" + str(x).replace('/', '_') + "'" for x in dataFields.values())



		mySql_insert_query = "INSERT INTO %s ( %s ) VALUES ( %s );" % ('property', columns, values)

		cursor = connection.cursor()
		cursor.execute(mySql_insert_query, dataFields.values())
		connection.commit()
		print(cursor.rowcount, "Record inserted successfully into property table")
		cursor.close()

	except mysql.connector.Error as error:
	    print("Failed to insert record into table {}".format(error))

	finally:
	    if (connection.is_connected()):
	        connection.close()
	        print("MySQL connection is closed")


if __name__=="__main__":
	readData()
