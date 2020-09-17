

var usermoviearray1 = {
    "movarr": [
        { "id": "1", "time": "2" },
    ]
}
let reqbody1 = { "id": "3", "time": "1" }
function jsonpostformater(reqbody,usermoviearray){
    var idcheck = parseInt(reqbody.id)
    var timecheck = parseInt(reqbody.time)
    if(!idcheck){
        console.log("notnum");
        return(usermoviearray)
    }
    if (usermoviearray.movarr[0].id == reqbody.id) {
        usermoviearray.movarr[0].time = reqbody.time
        return(usermoviearray)
    }
    
    let currentindex
    usermoviearray.movarr.forEach(userelement => {
        //if already on watch move to front and update to latest time
        if (userelement.id == reqbody.id) {
            usermoviearray[currentindex].time = reqbody.time
            usermoviearray.unshift(usermoviearray.splice(currentindex, 1)[0])
            console.log("inforeach");
            return(usermoviearray)
        }
        currentindex++;
    });
    usermoviearray.movarr.unshift(reqbody1)
    return(usermoviearray)
}
console.log(JSON.stringify(jsonpostformater(reqbody1,usermoviearray1)));
reqbody1 = { "id": "asd3", "time": "asd 2" }
console.log(JSON.stringify(jsonpostformater(reqbody1,usermoviearray1)));
reqbody1 = { "id": "asd3", "time": "asd 2" }
console.log(JSON.stringify(jsonpostformater(reqbody1,usermoviearray1)));
reqbody1 = { "id": "asd3", "time": "asd 2" }
console.log(JSON.stringify(jsonpostformater(reqbody1,usermoviearray1)));
reqbody1 = { "id": "asd3", "time": "asd 2" }
console.log(JSON.stringify(jsonpostformater(reqbody1,usermoviearray1)));
reqbody1 = { "id": "asd3", "time": "asd 2" }

console.log(JSON.stringify(jsonpostformater(reqbody1,usermoviearray1)));
reqbody1 = { "id": "4", "time": "4" }
console.log(JSON.stringify(jsonpostformater(reqbody1,usermoviearray1)));
reqbody1 = { "id": "4", "time": "5" }
console.log(JSON.stringify(jsonpostformater(reqbody1,usermoviearray1)));
reqbody1 = { "id": "4", "time": "6" }
console.log(JSON.stringify(jsonpostformater(reqbody1,usermoviearray1)));