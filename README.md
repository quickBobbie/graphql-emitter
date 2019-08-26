# graphql-emitter

##### Package for building graphql schema using sugar syntax

For the package to work correctly, you must install the graphql module

+ Install graphql package

    ~~~~~
    npm install --save graphql
    
    or
    
    yarn add graphql
    ~~~~~

+ Install graphql-emitter package
    ~~~~
    npm install --save git+https://github.com/quickBobbie/graphql-emitter.git
    
    or
    
    yarn add https://github.com/quickBobbie/graphql-emitter.git
    ~~~~


Creating a GraphQL schema requires just 3 simple steps:

1. Create emitter
    ~~~~~
    const GQLEmitter = require("graphql-emitter");
    const emitter = new GQLEmitter(GRAPHQL_OBJECT_TYPE);
    ~~~~~

2. Set GraphQL event
    ~~~~~
    emitter.query("user", GRAPHQL_EVENT_ARGS, GRAPHQL_RESOLVE_CALLBACK);
    emitter.mutation("user", GRAPHQL_EVENT_ARGS, GRAPHQL_RESOLVE_CALLBACK);
    
    // if returned type equal array
    
    emitter.query("users[]", GRAPHQL_EVENT_ARGS, GRAPHQL_RESOLVE_CALLBACK);
    ~~~~~

3. Export GraphQl Schema
    ~~~~~
    module.exports = emitter.export();
    ~~~~~