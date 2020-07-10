# sqlgui
SQLite query practice site built on a MERN (Mongo, Express, React, Nodejs) stack.

Can be found at http://ec2-13-58-227-8.us-east-2.compute.amazonaws.com/

Site visitors can practice their SQL by executing and saving queries against a sample SQLite database of data related to a music store.
The db has no read or write protections, so anyone can totally break it if they'd like, but since they actually are interacting with a copy stored in memory, it can be restored easily.
The library used to manage this can be found here: https://github.com/sql-js/sql.js

Although everyone can save queries to a list, these are stored in app memory and will be lost when the page is left or refreshed. To persist queries, people can make an account if they'd like.

I wanted to learn about modern auth techniques beyond session cookies (specifically using JWT), so I took a deep dive here that and implemented a JWT/Refresh token approach largely inspired by: https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/
Authenticated users' data and their saved queries are stored in a mongodb store running on the same machine. 

It is deployed on an AWS EC2 free-tier instance.

## Other tools/libraries used:
### Frontend:
- create-react-app
- react-bootstrap
- yarn
- axios
- prettier (dev only)

### Backend/server:
- Express
- Mongodb and mongoose
- bcrypt
- @hapi/boom and @hapi/Joi
- jsonwebtoken

## Running the project yourself
### Requirements: `nodejs` (with `npm`) and `mongodb`
1. clone the repo locally and `cd sqlgui`
2. `cd server/` and `mkdir config && cd config` 
3. create a json file named `default.json` and edit it to contain the following:
```
{
  "myprivatekey": [a String private key of your choice goes here],
  "cookie": {
    "maxAge": 2592000000,
    "httpOnly": true,
    "secure": false
  },
  "originDev": "http://localhost:3000",
  "originProd": "http://localhost:5000",
  "localMongoAddress": "mongodb://localhost/sqlgui"
}
```
4. Make sure mongo demon is running on your local computer. Try `brew services ls` and check the status (if you installed mongo with Homebrew)
5. From the  `sqlgui/server/` directory, run `yarn install` and then `yarn devdebug`. If you you see 
```
  server:server Listening on port 9000 +0ms
Connected to MongoDB...
``` 
you're good to go.

5.Now that the server is running,  `cd` to `sqlgui/frontend` and run `yarn install`, then `yarn start`

Head over to localhost:3000 and check it out.


## Next steps
- TLS for properly handled login forms
- Tests(!!)
- Separate mongo to a container of its own
- Implement proper refresh token invalidation ( see: https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/#logout_token_invalidation )
- SQLite Write access restrictions and/or restart the server periodically (or automatically) to reset it to pristine state
- Saved query list reordering
