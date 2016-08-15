'use strict';

module.exports = [
  {
    name: 'Cars',
    description: 'Vehicular data which consists of names, cylinders and displacement',
    dataset: {
      name: 'cars.json',
      url: '/data/cars.json'
    }
  },
  {
    name: 'Jobs',
    description: 'Job demographics such as job type, sex and count',
    dataset: {
      name: 'jobs.json',
      url:  '/data/jobs.json'
    }
  },
  {
    name: 'Gapminder',
    description: 'Year, country, population, fertility',
    dataset: {
      name: 'gapminder.json',
      url:  '/data/gapminder.json'
    }
  },
  {
    name: 'Climate',
    description: 'Climate attributes such as temperature by lat-long',
    dataset: {
      name: 'climate.json',
      url:  '/data/climate.json'
    }
  }
];
