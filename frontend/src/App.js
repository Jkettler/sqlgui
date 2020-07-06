import React, { useEffect, useState, useContext } from "react";
import "./App.css";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import FormControl from "react-bootstrap/FormControl";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Jumbotron from "react-bootstrap/Jumbotron";
import Alert from "react-bootstrap/Alert";
import ResultsTable from "./components/ResultsTable";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import AuthModal from "./components/AuthModal";
import SavedQueryList from "./components/SavedQueryList";
import { withAuthSync, logout } from "./components/withAuthSync";

const App = (props) => {
  const { jwt, setJwt, user, setUser, logout } = props;
  const [queryError, setQueryError] = useState(null);

  const [networkError, setNetworkError] = useState(null);
  const [loginError, setLoginError] = useState(null);

  const [results, setResults] = useState(null);

  const [currentQueryData, setCurrentQueryData] = useState({
    query: "",
    name: "",
  });

  const [savedQueries, setSavedQueries] = useState([]);
  const [selectedQIdx, setSelectedQIdx] = useState(null);

  const apiUrl = "http://localhost:9000";
  const queryUrl = `${apiUrl}/api/query`;

  useEffect(() => {
    const qData = savedQueries[selectedQIdx];

    if (qData) {
      setCurrentQueryData(qData);
    }
  }, [selectedQIdx, savedQueries]);

  function queryServer() {
    setResults(null);
    setQueryError(null);
    axios
      .post(queryUrl, {
        query: currentQueryData.query,
      })
      .then((res) => {
        const {
          data: { results, error },
        } = res;

        setResults(results);
        setQueryError(error);
      })
      .catch((e) => {
        setNetworkError(e);
      });
  }

  axios.interceptors.request.use(
    (config) => {
      const { origin } = new URL(config.url);
      const allowedOrigins = [apiUrl];

      if (jwt && allowedOrigins.includes(origin)) {
        config.headers.authorization = `Bearer ${jwt.jwToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  function selectSavedQuery(e) {
    setSelectedQIdx(e.target.value);
  }

  const updateQuery = (e) => {
    const {
      target: { value },
    } = e;
    setCurrentQueryData({ ...currentQueryData, query: value });
  };

  const updateQueryName = (e) => {
    const {
      target: { value },
    } = e;
    setCurrentQueryData({ ...currentQueryData, name: value });
  };

  return (
    <div className="App">
      <Container className={"MainContainer"} fluid="lg">
        <Jumbotron>
          <Container>
            <h1>Learn You a SQL For Great Good</h1>
            {user && <h3>{`Welcome back ${user.name}!`}</h3>}
          </Container>
          {user ? (
            <ButtonGroup>
              <Button
                onClick={() =>
                  logout().then(() => {
                    setJwt(null);
                    setUser(null);
                  })
                }
              >
                logout
              </Button>
            </ButtonGroup>
          ) : (
            <AuthModal
              buttonTitle="Login To Save Your Work"
              setUser={setUser}
              setJwt={setJwt}
            />
          )}
        </Jumbotron>
        <Row>
          {savedQueries.length > 0 && (
            <SavedQueryList
              savedQueries={savedQueries}
              onClick={selectSavedQuery}
            />
          )}
          <Col>
            <Form.Group>
              <InputGroup>
                <FormControl
                  type="text"
                  placeholder="Query Name"
                  value={currentQueryData.name}
                  onChange={updateQueryName}
                />
                <InputGroup.Append>
                  <Button
                    disabled={
                      !currentQueryData.name.length ||
                      !currentQueryData.query.length
                    }
                    onClick={() =>
                      setSavedQueries((qrs) =>
                        qrs.concat({
                          name: currentQueryData.name,
                          query: currentQueryData.query,
                          _id: null,
                        })
                      )
                    }
                  >
                    +
                  </Button>
                </InputGroup.Append>
              </InputGroup>
            </Form.Group>

            <InputGroup>
              <FormControl
                as="textarea"
                size="lg"
                value={currentQueryData.query || ""}
                placeholder="Enter a SQLite Query"
                onChange={updateQuery}
              />
            </InputGroup>
            <Form.Group>
              <ButtonGroup>
                <Button
                  disabled={!currentQueryData.query.length}
                  onClick={queryServer}
                >
                  Execute Query
                </Button>
              </ButtonGroup>
            </Form.Group>

            {queryError && (
              <Form.Group>
                <Alert
                  dismissible
                  onClose={() => setQueryError(null)}
                  variant="danger"
                >
                  <span>{`${queryError}`}</span>
                </Alert>
              </Form.Group>
            )}
          </Col>
        </Row>
      </Container>
      {results ? (
        <Container fluid>{results.map(ResultsTable)}</Container>
      ) : null}
    </div>
  );
};

export default withAuthSync(App);
