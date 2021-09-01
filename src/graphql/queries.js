/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getCharacter = /* GraphQL */ `
  query GetCharacter($id: ID!) {
    getCharacter(id: $id) {
      id
      name
      wins
      losses
      winrate
      lanes
      createdAt
      updatedAt
    }
  }
`;
export const listCharacters = /* GraphQL */ `
  query ListCharacters(
    $filter: ModelCharacterFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCharacters(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        wins
        losses
        winrate
        lanes
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
