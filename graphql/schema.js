// build schema so it can be parsed  by express qraphql
const { buildSchema } = require("graphql");
// module.exports = buildSchema(`
//     type TestData{
//         text: String!
//         views: Int!
//     }
//     type RootQuery {
//         hello: TestData!,
//     }
//     schema {
//         query: RootQuery
//     }
// `);

/* 
input 
-----
data that use as argument --> we use input keyword
type 
----
what we get back after user created --> we use type keyword
schema
-------
what we use to define the schema --> we use schema keyword
*/
module.exports = buildSchema(`
    type Post{
        _id: ID!
        title: String!
        content: String!
        imageUrl: String
        creator: User! 
        createdAt: String!
        updatedAt: String!
    }

    type User{
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        posts: [Post!]!
    }

    input userInputData{
        email: String!
        name: String!
        password: String!
    }

    type AuthData{
        userId: ID!
        token: String!
        tokenExpiration: Int!
    }

    input PostInputData{
        title: String!
        content: String!
        imageUrl: String
    }

    type postData{
        posts: [Post!]!
        totalPosts: Int!
    }

    type RootMutation {
        createUser(userInput: userInputData!) : User!
        createPost(postInput: PostInputData!): Post!
        updatePost(id: ID!, postInput: PostInputData!): Post!
        deletePost(id: ID!): Boolean!
        updateStatus(status: String!): User!
    }

    type RootQuery {
        login(email: String!, password: String!): AuthData!
        posts(page: Int): postData!
        post(id: ID!): Post!
        user: User!
    }
    
    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);

/*
type RootQuery:
contains all different queries ! --> means it is required

query: 
object with all the queries
queries are the parts that we get data 

query field --> query type --> query resolver --> query resolver function
mutation field --> mutation type --> mutation resolver --> mutation resolver function

example 
-----------
{{base_url}}/graphql --> post req with json body with query
we define which data we want to get in the front
{
    "query":"{hello{text views}}"
}

in resolver --> we return all data 
but we can also return only the data we want to return from front end
*/
