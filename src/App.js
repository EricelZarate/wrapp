import React, { useState, useEffect } from "react";
import "./App.css";
import { API, Storage } from "aws-amplify";
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { listCharacters } from "./graphql/queries";
import {
  createCharacter as createCharacterMutation,
  deleteCharacter as deleteCharacterMutation,
} from "./graphql/mutations";

const initialFormState = {
  name: "",
  wins: 0,
  losses: 0,
  winrate: 0,
  lanes: [],
};

function App() {
  const [characters, setCharacters] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [winrate, setWinrate] = useState(0);
  useEffect(() => {
    fetchCharacters();
  }, []);

  async function onChange(e) {
    if (!e.target.files[0]) return;
    const file = e.target.files[0];
    setFormData({ ...formData, image: file.name });
    await Storage.put(file.name, file);
    fetchCharacters();
  }
  async function fetchCharacters() {
    const apiData = await API.graphql({ query: listCharacters });
    const charsFromAPI = apiData.data.listCharacters.items;
    await Promise.all(
      charsFromAPI.map(async (charac) => {
        if (charac.image) {
          const image = await Storage.get(charac.image);
          charac.image = image;
        }
        return charac;
      })
    );
    setCharacters(apiData.data.listCharacters.items);
  }
  async function createCharacter() {
    if (!formData.name || !formData.wins) return;
    await API.graphql({
      query: createCharacterMutation,
      variables: { input: formData },
    });
    if (formData.image) {
      const image = await Storage.get(formData.image);
      formData.image = image;
    }
    setCharacters([...characters, formData]);
    setFormData(initialFormState);
  }
  useEffect(() => {
    const total = parseInt(formData.wins) + parseInt(formData.losses);
    const winr = (formData.wins * 100) / total;
    formData.winrate = winr.toFixed(1);
    setWinrate(winr.toFixed(1));
  });
  async function deleteCharacter({ id }) {
    const newNotesArray = characters.filter((note) => note.id !== id);
    setCharacters(newNotesArray);
    await API.graphql({
      query: deleteCharacterMutation,
      variables: { input: { id } },
    });
  }

  return (
    <div className="App">
      <h1>My Characters App</h1>
      <input
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Character name"
        value={formData.name}
      />
      <input
        type="number"
        onChange={(e) => setFormData({ ...formData, wins: e.target.value })}
        placeholder="Character wins"
        value={formData.wins}
      />
      <input
        type="number"
        onChange={(e) => setFormData({ ...formData, losses: e.target.value })}
        placeholder="Character losses"
        value={formData.losses}
      />
      <input type="file" onChange={onChange} />
      <div>
        <b>Winrate: </b>
        {winrate}
      </div>
      <button onClick={createCharacter}>Create Note</button>
      <div style={{ marginBottom: 30 }}>
        {characters.map((character) => (
          <div key={character.id || character.name}>
            <h2>{character.name}</h2>
            <p>{character.winrate}</p>
            <button onClick={() => deleteCharacter(character)}>
              Delete character
            </button>
            {character.image && (
              <img src={character.image} style={{ width: 400 }} />
            )}
          </div>
        ))}
      </div>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);
