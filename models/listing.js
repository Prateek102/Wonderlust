const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";


// main()
// .then(()=>{
//     console.log("connected to DB");
// })
// .catch(err => console.log(err));

// async function main() {
//   await mongoose.connect(MONGO_URL);
// }


const listingSchema = new Schema({
    title :{
       type: String,
       required: true,
    } ,
    description : String,
    image: {
        type : String,
        default:"https://images.unsplash.com/photo-1638798169776-7092dd49e2ea?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" , 

        set: (v) => 
            v === "" ?
        "https://images.unsplash.com/photo-1638798169776-7092dd49e2ea?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" :v,
    },
    price :Number,
    location: String,
    country:String,
    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref: "Review",
        },
    ],

});

const Listing = mongoose.model("Listing",listingSchema);
// listing is created!

module.exports = Listing; //( Listing is a model)
