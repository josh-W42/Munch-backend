const db = require("./models");

const categories = [
  // multiple categories
  { name: "Breakfast" },
  { name: "Brunch" },
  { name: "Lunch" },
  { name: "Dinner" },
  { name: "Ramen" },
  { name: "Japanese" },
  { name: "Thai" },
  { name: "Mexican" },
  { name: "Vegetarian" },
  { name: "Vegan" },
  { name: "Halal" },
  { name: "Mediterranean" },
  { name: "Italian" },
];

const addManyCategories = async () => {
  const savedExamples = await db.Category.insertMany(categories); // creating many categories
  console.log("=======> Saved Many Categories.");
  console.log(savedExamples);
};

const oneCategory = { name: "Chinese" }; // single category

const addOneCategory = async () => {
  const savedOneExample = await db.Category.create(oneCategory); // creating the one category
  console.log("=======> Saved One Category.");
  console.log(savedOneExample);
};

const oneRestaurant = {
  name: `Shin-Sen-Gumi`,
  email: "ShinSenGumi@gmail.com",
  password: "password",
  profileUrl: "https://shinsengumigroup.com/",
  menu: [
    {
      name: "Tonkotsu Ramen",
      description: "Pork broth ramen w/ shaschu",
      price: 13,
      type: "Ramen",
    },
    {
      name: "Shoyu Ramen",
      description: "Soy based ramen made with chicken",
      price: 13,
      type: "Ramen",
    },
    {
      name: "Chicken Karage",
      description: "Deep fried chicken with special sauce",
      price: 8,
      type: "Sides",
    },
  ],
};

const addOneRestaurant = async () => {
  const savedOneRestaurant = await db.Restaurant.create(oneRestaurant);
  const japanese = await db.Category.findOne({name: "Japanese"})
  savedOneRestaurant.category = japanese
  savedOneRestaurant.save();
  console.log("============> Restaurant was added to the database")
  console.log(savedOneRestaurant)
};

// >>>>>>>> run the functions <<<<<<<<<<<
// addManyCategories();
// addOneCategory();
// addOneRestaurant();
