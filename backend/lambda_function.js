const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

/**
 * AWS Lambda function to handle CRUD operations for the Notes App
 */
exports.handler = async (event) => {
    let body;
    let statusCode = 200;
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Required for CORS
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    };

    try {
        switch (event.httpMethod) {
            case 'DELETE':
                const id = event.queryStringParameters.id;
                await dynamo.delete({
                    TableName: "NotesTable",
                    Key: { id }
                }).promise();
                body = { message: `Deleted item ${id}` };
                break;
            case 'GET':
                const data = await dynamo.scan({ TableName: "NotesTable" }).promise();
                body = data.Items;
                break;
            case 'POST':
                const postJSON = JSON.parse(event.body);
                await dynamo.put({
                    TableName: "NotesTable",
                    Item: {
                        id: postJSON.id,
                        title: postJSON.title,
                        content: postJSON.content,
                        category: postJSON.category || 'General',
                        isPinned: postJSON.isPinned || false,
                        timestamp: new Date().toISOString(),
                        lastModified: new Date().toISOString()
                    }
                }).promise();
                body = { message: `Added item ${postJSON.id}` };
                break;
            case 'PUT':
                const putJSON = JSON.parse(event.body);
                await dynamo.update({
                    TableName: "NotesTable",
                    Key: { id: putJSON.id },
                    UpdateExpression: "set title = :t, content = :c, category = :cat, isPinned = :p, lastModified = :m",
                    ExpressionAttributeValues: {
                        ":t": putJSON.title,
                        ":c": putJSON.content,
                        ":cat": putJSON.category,
                        ":p": putJSON.isPinned,
                        ":m": new Date().toISOString()
                    }
                }).promise();
                body = { message: `Updated item ${putJSON.id}` };
                break;
            default:
                throw new Error(`Unsupported method "${event.httpMethod}"`);
        }
    } catch (err) {
        statusCode = 400;
        body = err.message;
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers
    };
};
