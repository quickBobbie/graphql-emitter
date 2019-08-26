const {
    GraphQLSchema,
    GraphQLList,
    GraphQLObjectType
} = require("graphql");

module.exports = function(objectType) {
    const OBJECT_TYPE = objectType;

    let query = { name: "Query", fields: {} };
    let mutation = { name: "Mutation", fields: {} };
    
    const resolve = (callbacks) => {
        return async (root, args, context, info) => {
            try {
                for (let callback of callbacks) {
                    let result = await callback(root, args, context, info);

                    if (result) {
                        return result;
                    }
                }
            } catch(err) {
                return err;
            }
        }
    };

    const emitter = (type, eventString, args, callbacks) => {
        let [isList, event] = parseEvent(eventString);

        let obj = {
            type: isList ? GraphQLList(OBJECT_TYPE) : OBJECT_TYPE,
            args: args,
            resolve: resolve(callbacks)
        };

        if (!obj.args || typeof obj.args !== "object" || Object.keys(obj.args).length === 0) {
            delete obj.args;
        }
        if (type === "query") {
            query.fields[event] = obj;
        } else if (type === "mutation") {
            mutation.fields[event] = obj;
        }
    };

    const parseEvent = (eventString) => {
        let isList = eventString.indexOf("[]") !== -1;

        return [isList, eventString.replace(/\[]/gi, '')];
    };

    this.query = (event, args, ...callbacks) => {
        emitter("query", event, args, callbacks);
    };

    this.mutation = (event, args, ...callbacks) => {
        emitter("mutation", event, args, callbacks);
    };

    this.export = () => {
        let config = {
            query: new GraphQLObjectType(query),
            mutation: new GraphQLObjectType(mutation)
        };

        return new GraphQLSchema(config);
    };

    return this;
};