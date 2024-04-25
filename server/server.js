const express = require('express');


//Need Apollo Server require
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { typeDefs, resolvers } = require('./schemas');
const path = require('path');
const { authMiddleware } = require('./utils/auth');
const db = require('./config/connection');
//const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;




//Appollo server with schemas
const server = new ApolloServer({
  typeDefs,
  resolvers,
  
});


const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();


  

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());


  app.use('/graphql', expressMiddleware(server, {
    //defiing where path will be
    context: authMiddleware
  }));

  if (process.env.NODE_ENV === 'production') {

    app.use(express.static(path.join(__dirname, '../client/dist')));
  
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

 


  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`)
    });
  });

};


startApolloServer();
