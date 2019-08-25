const {
    GraphQLSchema,
    GraphQLList,
    GraphQLObjectType
} = require("graphql");

module.exports = function(objectType) {
    const OBJECT_TYPE = objectType;

    let query = { name: "Query", fields: {} };
    let mutation = { name: "Mutation", fields: {} };

    const emitter = (type, eventString, args, callback) => {
        let [isList, event] = parseEvent(eventString);

        let obj = {
            type: isList ? GraphQLList(OBJECT_TYPE) : OBJECT_TYPE,
            args: args,
            resolve: callback
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

    this.query = (event, args, callback) => {
        emitter("query", event, args, callback);
    };

    this.mutation = (event, args, callback) => {
        emitter("mutation", event, args, callback);
    };

    this.export = () => {
        let config = {
            query: new GraphQLObjectType(query),
            mutation: new GraphQLObjectType(mutation)
        };

        return new GraphQLSchema(config);
    };

    return this
};