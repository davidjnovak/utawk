// Welcome Component
// Locational Access

/**        
 * This method fetches the location of the user's device. 
 * It raises an exception if the user does not allow location
 * tracking services.
 * @return the position of the user's device, including coordinates,
 * timestamp, speed, and altitude if successful, and an error
 * message if unsuccessful.
 * */
function getLocation() {
    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    }
    else{
        console.log("Browser doesn't support Geolocation")
    }
}

function showPosition(position){
    console.log("coords: " + position.coords.latitude + ", " + position.coords.longitude)
}
function showError(error){
    if(error.PERMISSION_DENIED){
        console.log("User denied access to GeoLocation")
    }
}
export {getLocation}   
