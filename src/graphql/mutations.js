/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createCharacter = /* GraphQL */ `
  mutation CreateCharacter(
    $input: CreateCharacterInput!
    $condition: ModelCharacterConditionInput
  ) {
    createCharacter(input: $input, condition: $condition) {
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
export const updateCharacter = /* GraphQL */ `
  mutation UpdateCharacter(
    $input: UpdateCharacterInput!
    $condition: ModelCharacterConditionInput
  ) {
    updateCharacter(input: $input, condition: $condition) {
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
export const deleteCharacter = /* GraphQL */ `
  mutation DeleteCharacter(
    $input: DeleteCharacterInput!
    $condition: ModelCharacterConditionInput
  ) {
    deleteCharacter(input: $input, condition: $condition) {
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
