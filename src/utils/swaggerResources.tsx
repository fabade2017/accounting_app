// src/utils/swaggerResources.ts
// src/utils/swaggerResources.ts
// export interface SwaggerResource {
//     name: string;
//     path: string;
// }

/*
export const getSwaggerResources = async (): Promise<SwaggerResource[]> => {
    const SWAGGER_URL = "http://localhost:5017/swagger/v1/swagger.json";

    const res = await fetch(SWAGGER_URL);
    const swagger = await res.json();

    const resources: SwaggerResource[] = [];

    for (const path in swagger.paths) {
        const endpoint = swagger.paths[path];

        // 1. Must be GET
        if (!endpoint.get) continue;

        // 2. Must not contain parameters (no /{id})
        if (path.includes("{")) continue;
const name = path.split("/")[2]
        // Resource name = last part of path
        const cleanName = path.replace("/", "");
        console.log(JSON.stringify({
            name,cleanName,
            path,
        }));
        resources.push({
            name: name,
            path,
        });
    }

    return resources;
};*/
export interface SwaggerResource {
    name: string;
    path: string;
    fields: string[];
}

export const getSwaggerResources = async (): Promise<SwaggerResource[]> => {
    const SWAGGER_URL = "http://localhost:5017/swagger/v1/swagger.json";
    const res = await fetch(SWAGGER_URL);
    const swagger = await res.json();

    const resources: SwaggerResource[] = [];
  
    for (const path in swagger.paths) {
        const endpoint = swagger.paths[path];

        // Only GET list endpoints (skip /{id})
    //    if(endpoint.content().contains('report')){console.log(JSON.stringify(endpoint));}
  const pathLower = path.toLowerCase();

        if (endpoint.put) continue;
        if (path.includes("{")) continue;
// if (pathLower.includes("report")) {
//     console.log("Report Endpoint Found:", pathLower, endpoint);
// }
        const name = path.split("/").pop() || "";

        let fields: string[] = [];

        // Try to get fields from GET schema (if any)
//         if (pathLower.includes("report")) {
//     console.log("Reached here:", pathLower, endpoint);
// }
        let response200 ;
     // response200 = endpoint.get.responses?.["200"];
        if(endpoint.get){  response200 = endpoint.get.responses?.["200"];}
        if(endpoint.post){  response200 = endpoint.post.responses?.["200"];}
       //  const  = endpoint.post.responses?.["200"];
        const schema = response200?.content?.["application/json"]?.schema;

        // CASE 1: GET schema has $ref (rare in your Swagger) — fallback
        if (schema?.$ref) {
            const ref = schema.$ref.split("/").pop();
            const model = swagger.components.schemas[ref];
            if (model?.properties) {
                fields = Object.keys(model.properties);
            }
        }

        // CASE 2: If GET schema is empty, use POST example
        if (fields.length === 0 && endpoint.post) {
            const example =
                endpoint.post.requestBody?.content?.["application/json"]?.example;
            if (example) {
                fields = Object.keys(example);
            }
        }
//         if (pathLower.includes("report")) {
//     console.log("Reached here:", name, path, JSON.stringify(fields));
// }
        // Push the resource
        resources.push({
            name,
            path,
            fields,
        });
    }

    return resources;
};

/*
export const getSwaggerResources = async (): Promise<SwaggerResource[]> => {
    const SWAGGER_URL = "http://localhost:5017/swagger/v1/swagger.json";

    const res = await fetch(SWAGGER_URL);
    const swagger = await res.json();

    const resources: SwaggerResource[] = [];

    for (const path in swagger.paths) {
        const endpoint = swagger.paths[path];

        // Only list endpoints (GET)
        if (!endpoint.get) continue;

        // Skip /xxx/{id}
        if (path.includes("{")) continue;

        // Extract model/schema from responses
        let fields: string[] = [];

        const responses = endpoint.get.responses;
        const response200 = responses?.["200"];

        const schema =
            response200?.content?.["application/json"]?.schema;

        // If schema is array of objects
        if (schema?.items?.$ref) {
            const refName = schema.items.$ref.replace("#/components/schemas/", "");

            const model = swagger.components.schemas[refName];

            if (model?.properties) {
                fields = Object.keys(model.properties);
            }
        }

        const name = path.split("/").pop() || "";

        resources.push({
            name,
            path,
            fields,
        });
    }

    return resources;
};


*/
                    //  const SWAGGER_URL = "http://localhost:5017/swagger/v1/swagger.json";
                    // export async function getSwaggerResources(): Promise<SwaggerResource[]> {
                    //     const res = await fetch(SWAGGER_URL);

                    //     if (!res.ok) {
                    //         throw new Error("Failed to load Swagger schema");
                    //     }

                    //     const json = await res.json();

                    //     // Convert schema to resources list
                    //     return Object.keys(json.paths).map((path) => {
                    //         const name = path.split("/")[2] +"" + path.split("/")[3]; // e.g. "/users" → "users"
                    //         if(path.split("/")[3] == "{id}") return { }
                    //         return { name };
                    //     });
                    // }
// export interface SwaggerResource {
//     name: string;
//     path: string;
//     methods: string[];
// }

// export const getSwaggerResources = async (): Promise<SwaggerResource[]> => {
//     const res = await fetch("/swagger.json");
//     const swagger = await res.json();

//     const resources: SwaggerResource[] = [];

//     for (const path in swagger.paths) {
//         const methods = Object.keys(swagger.paths[path]);
//         const name = path.replace(/^\/|\/$/g, ""); // remove slashes
//         resources.push({ name, path, methods });
//     }

//     return resources;
// };
