const express =  require(`express`);
const app  =  express();
const path = require(`path`);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
const  ejsMate = require("ejs-mate");
app.engine('ejs',ejsMate);
const port =  8080;
const { v4: uuidv4 } = require('uuid');  // uuid package is required!!!!!!!!!
const mongoose = require('mongoose');
const Listing = require("./models/listing");
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
const wrapAsync = require("./utility/wrapAsync.js")
const ExpressError = require("./utility/ExpressError.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const { listingSchema,reviewSchema } = require("./schema.js");
const Review  = require("./models/review.js");



main()
.then(()=>{
    console.log("connected to DB");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}



app.use(express.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.json());





//*************************************************** */

// Home route 
app.get("/",(req,res)=>{
res.send(`Hi i am root!`);
});

const validateListing = (req,res,next) =>{
    let { error } = listingSchema.validate(req.body);
    if(err){
      let errMsg = error.details.map((el)=> el.message).join(",");
      throw new ExpressError(404,errMsg);
    } else{
        next();
    }
};

const validateReview = (req,res,next) =>{
    let { error } = reviewSchema.validate(req.body);
    if(err){
      let errMsg = error.details.map((el)=> el.message).join(",");
      throw new ExpressError(404,errMsg);
    } else{
        next();
    }
};




//******************************************************* */
// This is Index route
app.get("/listings",  wrapAsync(async (req,res) => {
    const allListing = await Listing.find({});
     res.render("listings/index",{allListing});
 }));
 
 //********************************************************** */
 
 // New route   // First this route be written
 app.get("/listings/new",(req,res)=> {
     res.render("listings/new");
     
    });
    
//************************************************************* */

    // Show route // After that this route to be return 
    app.get("/listings/:id", wrapAsync(async(req,res)=>{
       let { id } = req.params;
     const listing  =  await Listing.findById(id);
     res.render("listings/show",{listing});
    }));
    //Create route
//****************************node********************************************* */
    app.post("/listings",
        wrapAsync( async(req,res,next)=>{
      let result =  listingSchema.validate(req.body);
      consle.log(result);
      if(result.error){
        throw new ExpressError(400,result,error);
      }
          const newListing = new Listing(req.body.listing);
          await newListing.save();
          res.redirect("/listings");
    
      
    })
);
//**************************************************************************/
// Edit Listing route
app.get("/listings/:id/edit",  wrapAsync(async(req,res)=>{
    let {  id } = req.params;
    const listing  = await Listing.findById(id);
    res.render("listings/edit", { listing } );
}));

//********************************************************************** */
// Accepeting Put request data

app.put("/listings/:id", wrapAsync( async (req, res) => {
    let { id } = req.params;
    if(!req.body.listing){
        throw new ExpressError(400,"Send valid data for listing!")
    }
  
    // Spread the req.body.listing object to update the document
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  
    // Redirect to the listings page
    res.redirect(`/listings/${id}`); // redirect on show route
  }));
//***************************************************************** */

// Delete route 

app.delete("/listings/:id",  wrapAsync(async (req, res) => {
    try {
        const { id } = req.params;

        // Ensure that id is passed as part of the query object
        const deleteListing = await Listing.findByIdAndDelete(id);

        // Log the deleted document
        console.log(deleteListing);

        // If no listing is found, handle the case
        if (!deleteListing) {
            return res.status(404).send("Listing not found");
        }

        // Redirect to the listings page
        res.redirect("/listings");
    } catch (error) {
        console.error("Error deleting listing:", error);
        res.status(500).send("Internal Server Error");
    }
}));




// app.get("/testListing",async(req,res)=>{

//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description :"By the beach",
//         price: 1200,
//         location:"Caongute,Goa",
//         country :"India"
//     });

//    await sampleListing.save().then((res)=>{
//         console.log(res);
//     })
//     .catch(err => console.log(err));

//     res.send("successfully Testing has Done!");
// });



// Post Route  reviews
app.post("/listings/:id/reviews", validateReview, wrapAsync(async(req,res)=> {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);

}));

app.all("*" ,(req,res,next)=>{
    next(new ExpressError(404, "Page not Fount!"));
})

//Error Handling Middleware
app.use((err,req,res,next)=> {
   let{statusCode=500, message="Something went wrong"} = err;
   res.render("error.ejs",{message});
});



app.listen(8080,()=>{
    console.log("server is listing to port 8080");
});
