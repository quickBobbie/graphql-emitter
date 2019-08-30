const {
    GraphQLSchema,
    GraphQLList,
    GraphQLObjectType
} = require("graphql");

module.exports = function(objectType) {
    const OBJECT_TYPE = objectType;

    let config = {
        query: {
            name: "Query",
            fields: {}
        },
        mutation: {
            name: "Mutation",
            fields: {}
        }
    };

    const parseEvent = (eventString) => {
        let isList = eventString.indexOf("[]") !== -1;

        return [isList, eventString.replace(/\[]/gi, '')];
    };

    const parseCallbacks = (callbacks) => {
        let args = {};

        if (!(callbacks[0] instanceof Promise) && typeof callbacks[0] !== 'function') {
            args = callbacks[0];
            callbacks = callbacks.slice(1);
        }

        callbacks = callbacks.filter(callback => {
            return typeof callback === 'function';
        });

        return [args, callbacks];
    };

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

    const getField = (isList, args, callback) => {
        let [gqlArgs, callbacks] = parseCallbacks(args);

        if (!callbacks || !callbacks.length) callback && callback();

        let field = {
            type: isList ? GraphQLList(OBJECT_TYPE) : OBJECT_TYPE,
            args: gqlArgs,
            resolve: resolve(callbacks)
        };

        for (let key in field) {
            if (!field[key] || (typeof field[key] === 'object' && !Object.keys(field[key]).length)) {
                delete field[key];
            }
        }

        return { ...field };
    };

    const emitter = (type, eventString, args) => {
        let [isList, event] = parseEvent(eventString);
        config[type].fields[event] = getField(isList, args, () => {
            console.log(`No callbacks for ${ type } "${ event }"`)
        });
    };

    this.query = (event, ...args) => {
        emitter("query", event, args);
    };

    this.mutation = (event, ...args) => {
        emitter("mutation", event, args);
    };

    this.export = () => {
        for (let key in config) {
            config[key] = new GraphQLObjectType(config[key]);
        }

        return new GraphQLSchema(config);
    };

    return this;
};