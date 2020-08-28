import React, { Component } from "react";
import axios from "axios";
import Joke from "./Joke";
import uuid from "uuid/dist/v4";

import "./JokeList.css";

export default class JokeList extends Component {
  static defaultProps = {
    numJokesToGet: 10,
  };
  constructor(props) {
    super(props);

    this.state = {
      jokes: JSON.parse(window.localStorage.getItem("jokes")) || [],
      loading: false,
    };
    this.seenJokes = new Set(this.state.jokes.map((j) => j.text));
    this.getJokes = this.getJokes.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    // Load Jokes
    if (this.state.jokes.length === 0) this.getJokes();
  }
  async getJokes() {
    try {
      let jokes = [];
      while (jokes.length < this.props.numJokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com/", {
          headers: { Accept: "application/json" },
        });
        if (!this.seenJokes.has(res.data.joke)) {
          jokes.push({ id: uuid(), text: res.data.joke, votes: 0 });
        } else {
          console.log("FOUND A DUPLICATE!");
          console.log(res.data.joke);
        }
      }

      this.setState(
        (st) => ({ loading: false, jokes: [...st.jokes, ...jokes] }),
        () =>
          window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
      );
    } catch (error) {
      alert(error);
      this.setState({ loading: false });
    }
  }

  handleVote(id, delta) {
    this.setState(
      (st) => ({
        jokes: st.jokes.map((j) =>
          j.id === id ? { ...j, votes: j.votes + delta } : j
        ),
      }),
      () =>
        window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
    );
  }
  handleClick() {
    this.setState({ loading: true }, this.getJokes);
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="JokeList__spinner">
          <i className="far fa-8x fa-laugh fa-spin"></i>
          <h1 className="Joke__title">Loading</h1>
        </div>
      );
    }

    let jokes = this.state.jokes.sort((a, b) => b.votes - a.votes);
    return (
      <div className="JokeList">
        <div className="JokeList__sidebar">
          <h1 className="JokeList__title">
            <span> Dad</span> Joke
          </h1>
          <img
            src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg"
            alt="dadIcon"
          />
          <button className="JokeList__getmore" onClick={this.handleClick}>
            New Joke
          </button>
        </div>
        <div className="JokeList__jokes">
          {jokes.map((j) => (
            <Joke
              key={j.id}
              text={j.text}
              votes={j.votes}
              upvote={() => {
                this.handleVote(j.id, 1);
              }}
              downvote={() => {
                this.handleVote(j.id, -1);
              }}
            />
          ))}
        </div>
      </div>
    );
  }
}
