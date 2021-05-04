console.log('hello');
userobj=[
    {
        "posts": [
            "6088fb133bf1c46388f36479"
        ],
        "followers": [],
        "following": [
            "60813ae15abf573fc8ee61ae"
        ],
        "_id": "60813e0239b9cc416468818a",
        "name": "ahmad",
        "email": "ahmad@gmail.com",
        "subs": "Ali",
        "joinigDate": "2021-04-22T09:12:34.962Z",
        "__v": 2
    },

    {
        "posts": [
            "60887f67a7eeaa5c340c02c7",
            "60887f99a7eeaa5c340c02c9"
        ],
        "followers": [
            "6085b1d2d737cdaef424ac83"
        ],
        "following": [
            "60813ae15abf573fc8ee61ae"
        ],
        "_id": "60813470352bdb49202f6884",
        "name": "kazim",
        "email": "kazim@gmail.com",
        "subs": "ahmad",
        "joinigDate": "2021-04-22T08:31:44.341Z",
        "__v": 4
    }
]

const obja = {    //array of objs
    "arr": [
   {"name":"afridi","player":"batsman"},{"name":"gul","player":"bowler"},{"name":"razzaq","player":"Allround"}]
  }
//console.log(obja.arr[1].name); //it will print gul
for (data in obja.arr){
 //console.log(data);
 for(innerdata in obja.arr[data]){
  // console.log(obja.arr[data][innerdata]+" "+ data);
 }
}
for(dataa in userobj){
    // console.log(dataa);
    console.log(userobj[dataa].posts);
}
    dataa=dataa;
    var i;
    for(i=0;i<dataa;i++)
    {
        //console.log(i);
         //console.log(userobj[i].posts+ "-data: "+dataa);
    }
    for(innerdata in userobj[dataa]){
        //console.log(userobj[dataa].posts+ "-data: "+data+" , inerdata"+ innerdata);
    }  

//console.log(userobj[1].posts[0]);




///////////

////////////////
// const obj1={
//   "name":"kazim",
//   "age": "26",
//   "arrxs":[{
//     "all":"rfr",
//     "qol":"qw"
//   }]
// };
// for(data in obj1)
// {
//   console.log(data);//it will show the name, age
//   console.log(obj1[data]);  // it will show the kazim , 26
// }

// const jobj = {
//   arr: ["aaa","vvv","ccc"]
// }
// console.log(jobj.arr);  //it will print the obj and show the ['aa','vvvv','ccc']

// const obja = {    //array of objs
//      "arr": [
//     {"name":"afridi","player":"batsman"},{"name":"gul","player":"bowler"},{"name":"razzaq","player":"Allround"}]
//    }
// //console.log(obja.arr[1].name); //it will print gul
// for (data in obja.arr){
//   //console.log(data);
//   for(innerdata in obja.arr[data]){
//     console.log(obja.arr[data][innerdata]+" "+ data);
//   }
// }