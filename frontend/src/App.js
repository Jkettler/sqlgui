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

  const [activeQuery, setActiveQuery] = useState({
    query: "",
    name: "",
  });

  const [savedQueries, setSavedQueries] = useState([]);
  const [localQueries, setLocalQueries] = useState([]);

  const apiUrl = "http://localhost:9000";
  const queryUrl = `${apiUrl}/api/query`;

  useEffect(() => {
    if (user) {
      setSavedQueries(user.queries);
    }
  }, [user]);

  const executeQuery = () => {
    setResults(null);
    setQueryError(null);
    axios
      .post(queryUrl, {
        query: activeQuery.query,
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
  };

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

  const onActiveQueryChange = (e) => {
    const { name, value } = e.target;
    setActiveQuery((inputs) => ({ ...inputs, [name]: value }));
  };

  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <div className="App">
      <Container className={"MainContainer"} fluid="xl">
        <Jumbotron>
          <Container>
            <h1>Learn You a SQL For Great Good</h1>
            {user && <h3>{`Welcome back ${user.name}!`}</h3>}
          </Container>
          {user ? (
            <ButtonGroup>
              <Button onClick={() => logout().then(reloadPage)}>logout</Button>
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
          {(!!localQueries.length || !!savedQueries.length) && (
            <SavedQueryList
              setActiveQuery={setActiveQuery}
              localQueries={localQueries}
              setLocalQueries={setLocalQueries}
              savedQueries={savedQueries}
              setSavedQueries={setSavedQueries}
            />
          )}

          <Col>
            <Form.Group>
              <InputGroup>
                <FormControl
                  type="text"
                  name="name"
                  placeholder="Query Name"
                  value={activeQuery.name}
                  onChange={onActiveQueryChange}
                />
                <InputGroup.Append>
                  <Button
                    disabled={
                      !activeQuery.name.length || !activeQuery.query.length
                    }
                    onClick={() =>
                      setLocalQueries((qrs) =>
                        qrs.concat({
                          name: activeQuery.name,
                          query: activeQuery.query,
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
                name="query"
                value={activeQuery.query || ""}
                placeholder="Enter a SQLite Query"
                onChange={onActiveQueryChange}
              />
            </InputGroup>
            <Form.Group>
              <ButtonGroup>
                <Button
                  disabled={!activeQuery.query.length}
                  onClick={executeQuery}
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
