# Technical Test

## Goal

Create an api using using nodejs that queries data from DynamoDB and has the following endpoints

* Get user by id
    Accepts an id(number) and returns the user which has that id
* List users by date joined.

## Data provided

* You will find a data.json file attached which contains an array of users.

```ts
interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    gender: 'Female' |
        'Genderfluid' | 
        'Male' | 
        'Polygender' | 
        'Bigender' | 
        'Agender' | 
        'Non-binary' | 
        'Genderqueer';
    ipAddress: string;
    dateJoined: number;
}
```

* You will have to populate a DynamoDB table using this json file.
* Use [dynamoose](https://dynamoosejs.com/) for all queries of dynamoDB

## Deliverables

* All resources(lambda + Api Gateway + DynamoDB, etc.) should be created and deployed using serverless framework.

* Open Api Schema(open api 3.0).

* Use of scan in DynamoDB is forbidden.
