# Express + Mysql + Docker project

## Getting Started

To start the app and the database, run the following command in the root directory:

````
docker-compose up --build
````

The first time the `init_script.sh` will run automatically also migrations and seeders.

## DB Rollback

**If you need to rollback the database** run the following npm script from a terminal:

````
npm run db-down
````

After that you can run:

````
docker-compose down
````

Then remove the `db-initialized.flag` file from the root of the repo and go back to **Getting Started** section


