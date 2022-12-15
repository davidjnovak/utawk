/*This class stores school information and functions that make the location algortim work
to find the closest school to the user. The appropriate information is returned for the webpage 
to update accordingly.*/

//this is the school information list, only 3 schools are in use as of right now
export const schoolList =
    [["UNCW", 34.2239, -77.8696, "uncwposts"],
     ["NC State", 35.7847, -78.6821, "ncstateposts"],
     ["App State", 36.2136, -81.6843, "appstateposts"]]


//this function talkes in a list of schools and the users coordinates
//the list being used is in this file but can easily be moved to another and updates to contain more schools
export function closest(list, userLat, userLng) {

    //seting variables for finding cloesest school and distance to it
    let userDis = 100000000 //initialy large number to find the lowest distance between user and school
    var userSchool = ""     //initializing string for closest school to user
    var collectionName = "" //initializing string for database collection name for closest school


    //iterating through school list
    for (let i = 0; i < list.length; i++) {
        let currentDis = distance(list[i][1], list[i][2], userLat, userLng)
        if (currentDis < userDis) {
          userDis = currentDis        //saves lowest distance between user and school
          userSchool = list[i][0]     //saves closest school name 
          collectionName = list[i][3] //saves closest schools database collection name
        } 
    }

    let values = [userSchool, userDis, collectionName] //stores user distance, school name, and schools database name in an array to be returned

    return values
}

//This function finds the distance between two coordinate points 
export function distance(lat1, lon1, lat2, lon2) {
   
    //Converting from degrees to radians
    lat1 = lat1 * Math.PI / 180
    lon1 = lon1 * Math.PI / 180

    lat2 = lat2 * Math.PI / 180
    lon2 = lon2 * Math.PI / 180
    
    //Distances from eachother
    let distLon = lon2 - lon1
    let distLat = lat2 - lat1

    //Variables for converting to miles
    let a = Math.pow(Math.sin(distLat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(distLon / 2),2)
    let c = 2 * Math.asin(Math.sqrt(a))
    let r = 3956; //radius of earth in miles
   
    //calculate the result
    return(c * r)
} 