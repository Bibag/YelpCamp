const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(() => console.log('Database connected!'))
    .catch(error => console('Database connect error!', error))

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '62270223b0c31f4ec72634b2',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry: { type: 'Point', coordinates: [cities[random1000].longitude, cities[random1000].latitude] },
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti tempora eaque veritatis possimus, aspernatur praesentium animi, esse maxime quidem obcaecati sunt nobis qui voluptatum nemo cumque ducimus molestias iste similique.',
            price,
            images: [
                {
                    url: 'https://res.cloudinary.com/wizzardimages/image/upload/v1647001480/YelpCamp/upuqhf5bxk59gzuxbse4.jpg',
                    filename: 'YelpCamp/upuqhf5bxk59gzuxbse4',
                },
                {
                    url: 'https://res.cloudinary.com/wizzardimages/image/upload/v1647002873/YelpCamp/rdi9ppng8qbrd6t1ytho.jpg',
                    filename: 'YelpCamp/rdi9ppng8qbrd6t1ytho',
                },
                {
                    url: 'https://res.cloudinary.com/wizzardimages/image/upload/v1647002875/YelpCamp/mx9kffqv6ps6aictfklk.jpg',
                    filename: 'YelpCamp/mx9kffqv6ps6aictfklk',
                },
                {
                    url: 'https://res.cloudinary.com/wizzardimages/image/upload/v1647002871/YelpCamp/jecvkgve8yarina5al72.jpg',
                    filename: 'YelpCamp/jecvkgve8yarina5al72',
                }
            ]
        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});