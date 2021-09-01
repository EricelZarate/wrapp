import React, { useState, useEffect } from "react";
import "./App.css";
import { API, Storage } from "aws-amplify";
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { listCharacters } from "./graphql/queries";
import {
  createCharacter as createCharacterMutation,
  deleteCharacter as deleteCharacterMutation,
} from "./graphql/mutations";
import {
  Input,
  TextField,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  Button,
  Card,
  CardHeader,
  Grid,
  Typography,
  makeStyles,
  ButtonGroup
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  image: {
    objectFit: "cover",
    width: "100%",
    height: "50vh",
    [theme.breakpoints.down("sm")]: {
      height: "30vh",
    },
    [theme.breakpoints.up("lg")]: {
      height: "45vh",
    },
  },
}));
const initialFormState = {
  name: "",
  wins: 0,
  losses: 0,
  winrate: 0,
  lanes: [],
};

function App() {
  const classes = useStyles();
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
    setCharacters(
      apiData.data.listCharacters.items.sort(function (a, b) {
        if (a.name > b.name) {
          return 1;
        } else return -1;
      })
    );
  }
  async function createCharacter() {
    if (!formData.name || !formData.wins) return;
    formData.lanes = roles;
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
  async function addWin(character) {
    await API.graphql({
      query: deleteCharacterMutation,
      variables: {
        input: { id: character.id },
      },
    });
    const total = parseInt(character.wins) + 1 + parseInt(character.losses);
    const winr = ((character.wins + 1) * 100) / total;
    const nimg = character.image + "";
    const newchar = {
      name: character.name,
      wins: parseInt(character.wins) + 1,
      losses: character.losses,
      winrate: winr.toFixed(1),
      image: nimg.split("/")[4].split("?")[0],
      lanes: character.lanes
    };
    await API.graphql({
      query: createCharacterMutation,
      variables: { input: newchar },
    });
    if (filter.length < 1)
      fetchCharacters();
    else
      fetchCharactersF(filter)
  }
  async function addLose(character) {
    await API.graphql({
      query: deleteCharacterMutation,
      variables: {
        input: { id: character.id },
      },
    });
    const total = parseInt(character.wins) + 1 + parseInt(character.losses);
    const winr = (character.wins * 100) / total;
    const nimg = character.image + "";
    const newchar = {
      name: character.name,
      wins: parseInt(character.wins),
      losses: parseInt(character.losses) + 1,
      winrate: winr.toFixed(1),
      image: nimg.split("/")[4].split("?")[0],
      lanes: character.lanes
    };
    await API.graphql({
      query: createCharacterMutation,
      variables: { input: newchar },
    });
    if (filter.length < 1)
      fetchCharacters();
    else
      fetchCharactersF(filter)
  }
  const [roles, setRoles] = useState([]);
  const handleChange = (event) => {
    setRoles(event.target.value);
  };
  const getBackColor = (val) => {
    if (val < 30) return "lightcoral";
    else if (val < 51) return "#ffef62";
    else return "lightgreen";
  };
  const getIcons = (character) => {
    var top = false;
    var mid = false;
    var jg = false;
    var supp = false;
    var adc = false;
    if (character.lanes)
      character.lanes.forEach((element) => {
        switch (element) {
          case "Top": {
            top = true;
            break;
          }
          case "Mid": {
            mid = true;
            break;
          }
          case "Adc": {
            adc = true;
            break;
          }
          case "Jg": {
            jg = true;
            break;
          }
          case "Supp": {
            supp = true;
            break;
          }
        }
      });
    return (
      <div>
        {top && <img src="top.png" alt="Top" width="40px"></img>}
        {mid && <img src="mid.png" alt="Mid" width="40px"></img>}
        {adc && <img src="dragon.png" alt="Adc" width="40px"></img>}
        {supp && <img src="support.png" alt="Support" width="40px"></img>}
        {jg && <img src="jg.png" alt="Jungla" width="40px"></img>}
      </div>
    );
  };
  const [filter, setFilter] = useState([])
  const handleAdc = () => {
    if (filter.includes('Adc')) {
      setFilter(filter.filter(function (value, index, arr) {
        return value !== 'Adc';
      }));
    } else {
      setFilter([...filter, 'Adc'])
    }
  }
  const handleTop = () => {
    if (filter.includes('Top')) {
      setFilter(filter.filter(function (value, index, arr) {
        return value !== 'Top';
      }));
    } else {
      setFilter([...filter, 'Top'])
    }
  }
  const handleJg = () => {
    if (filter.includes('Jg')) {
      setFilter(filter.filter(function (value, index, arr) {
        return value !== 'Jg';
      }));
    } else {
      setFilter([...filter, 'Jg'])
    }
  }
  const handleMid = () => {
    if (filter.includes('Mid')) {
      setFilter(filter.filter(function (value, index, arr) {
        return value !== 'Mid';
      }));
    } else {
      setFilter([...filter, 'Mid'])
    }
  }
  const handleSupp = () => {
    if (filter.includes('Supp')) {
      setFilter(filter.filter(function (value, index, arr) {
        return value !== 'Supp';
      }));
    } else {
      setFilter([...filter, 'Supp'])
    }
  }

  useEffect(() => {
    if (filter.length < 1)
      fetchCharacters()
    else
      fetchCharactersF(filter)
  }, [filter])

  async function fetchCharactersF(filter) {
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
    var filtered = []
    charsFromAPI.forEach((ch) => {
      if (
        filter.some(v => ch.lanes.includes(v)))
        filtered.push(ch)
    })
    setCharacters(
      filtered.sort(function (a, b) {
        if (a.name > b.name) {
          return 1;
        } else return -1;
      })
    );
  }

  const adding = false;
  const enabledel = false;
  return (
    <div className="App">
      <h1>My Characters App</h1>
      {adding && (
        <div>
          <TextField
            label="Nombre"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            value={formData.name}
          ></TextField>

          <TextField
            type="number"
            onChange={(e) => setFormData({ ...formData, wins: e.target.value })}
            label="Victorias"
            value={formData.wins}
          />
          <TextField
            type="number"
            onChange={(e) =>
              setFormData({ ...formData, losses: e.target.value })
            }
            label="Derrotas"
            value={formData.losses}
          />
          <FormControl>
            <InputLabel id="demo-mutiple-name-label">Roles</InputLabel>
            <Select
              labelId="demo-mutiple-name-label"
              id="demo-mutiple-name"
              multiple
              value={roles}
              onChange={handleChange}
              input={<Input />}
              style={{ minWidth: 150 }}
            >
              <MenuItem key={1} value={"Mid"}>
                Mid
              </MenuItem>
              <MenuItem key={2} value={"Top"}>
                Top
              </MenuItem>
              <MenuItem key={3} value={"Adc"}>
                Adc
              </MenuItem>
              <MenuItem key={4} value={"Supp"}>
                Supp
              </MenuItem>
              <MenuItem key={5} value={"Jg"}>
                Jg
              </MenuItem>
            </Select>
          </FormControl>

          <input
            type="file"
            onChange={onChange}
            style={{ marginLeft: 10, marginTop: "20px" }}
          />

          <div>
            <b>Winrate: </b>
            {winrate}
          </div>

          <Button onClick={createCharacter} variant="outlined">
            Agregar personaje
          </Button>
        </div>
      )}
      <div><ButtonGroup><Button style={{ background: filter.includes('Top') ? "lightblue" : 'white' }} > <img src="top.png" alt='' width={40} onClick={handleTop} ></img></Button>
        <Button style={{ background: filter.includes('Mid') ? "lightblue" : 'white' }} ><img src="mid.png" alt='' width={40} onClick={handleMid}></img></Button>
        <Button style={{ background: filter.includes('Adc') ? "lightblue" : 'white' }} ><img src="dragon.png" alt='' width={40} onClick={handleAdc}></img></Button>
        <Button style={{ background: filter.includes('Supp') ? "lightblue" : 'white' }} ><img src="support.png" alt='' width={40} onClick={handleSupp}></img></Button>
        <Button style={{ background: filter.includes('Jg') ? "lightblue" : 'white' }} ><img src="jg.png" alt='' width={40} onClick={handleJg}></img></Button></ButtonGroup></div>
      <div
        style={{
          paddingLeft: "10px",
          paddingRight: "10px",
          marginBottom: 30,
          marginTop: 30,
        }}
      >
        <Grid container spacing={1}>
          {characters.map((character) => (
            <Grid item xs={4} sm={3} xl={2}>
              <Card style={{ background: getBackColor(character.winrate) }}>
                <CardHeader
                  style={{ marginBottom: 0, paddingBottom: 0 }}
                  title={character.name}
                ></CardHeader>
                {getIcons(character)}
                {character.image && (
                  <img src={character.image} className={classes.image} />
                )}
                <div
                  style={{ display: "flex", justifyContent: "space-around" }}
                >
                  <div>
                    <Typography variant="caption">Victorias</Typography>
                    <Typography>{character.wins}</Typography>
                    <Button onClick={() => addWin(character)}>
                      <Typography variant="h5">+</Typography>
                    </Button>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <Typography variant="h5">{character.winrate}%</Typography>
                    <Typography variant="button">Winrate</Typography>
                  </div>
                  <div>
                    <Typography variant="caption">Derrotas</Typography>
                    <Typography>{character.losses}</Typography>
                    <Button onClick={() => addLose(character)}>
                      <Typography variant="h5">+</Typography>
                    </Button>
                  </div>
                </div>
                {enabledel && (
                  <button onClick={() => deleteCharacter(character)}>
                    Delete character
                  </button>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);
