# Express + Mysql + Docker project

## Getting Started

To start the app and the database, run the following command in the root directory:

```
docker-compose up --build
```

The first time the `init_script.sh` will run automatically also migrations and seeders.

## DB Rollback

**If you need to rollback the database** run the following npm script from a terminal (while the server is running):

```
npm run db-down
```

After that you can run:

```
docker-compose down
```

Then remove the `db-initialized.flag` file from the root of the repo and go back to **Getting Started** section

## SWAGGER UI

When the server is running you can go to the [SWAGGER](http://localhost:3000/api-docs/) page to interact with the UI and try the APIs

**HOW TO WORK WITH AUTH APIs:**

Some APIs requires to be authenticated with a token, how manage them:

- register an account if you haven't already done
- log in with your registered account
- the login API will return a bearer token to use for authenticated APIs
- press the button at the top right of the page with the padlock and insert your token, then confirm your choice
- you're ready to make the authenticated API calls you want, like `/buyProducts` and `/getPurchases`

**HOW TO PERFORM A PURCHASE:**

- make sure you have set the authorization token correctly
- make a `/getProducts` API call to find out the available products
- choose one of them and note down the product id
- call the `/buyProducts` API to purchase a product by passing it the id you wrote down
