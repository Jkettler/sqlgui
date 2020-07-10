import React, { useEffect, useState } from "react";
import "./App.css";

// React Bootstrap Imports
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Container,
  Form,
  FormControl,
  InputGroup,
  ButtonGroup,
  Row,
  Col,
  Jumbotron,
  Alert,
} from "react-bootstrap";

import ResultsTable from "./components/ResultsTable";
import AuthModal from "./components/AuthModal";
import SavedQueryList from "./components/SavedQueryList";
import { withAuthSync } from "./HOCs/withAuthSync";
import NoFocusButton from "./components/NoFocusButton";
import queryService from "./util/queryService";
import { useUser } from "./contexts/UserContext";

const App = ({ logout }) => {
  const { user } = useUser();

  const [queryError, setQueryError] = useState(null);
  const [networkError, setNetworkError] = useState(null);
  const [results, setResults] = useState(null);

  const [activeQuery, setActiveQuery] = useState({ query: "", name: "" });
  const [savedQueries, setSavedQueries] = useState(user ? user.queries : []);
  const [localQueries, setLocalQueries] = useState([]);

  useEffect(() => {
    if (user) setSavedQueries(user.queries);
    else setSavedQueries([]);

    return () => setSavedQueries([]);
  }, [user]);

  const executeQuery = () => {
    setResults(null);
    setQueryError(null);

    queryService.query
      .execute(activeQuery)
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

  const onActiveQueryChange = (e) => {
    const { name, value } = e.target;
    setActiveQuery((inputs) => ({ ...inputs, [name]: value }));
  };

  const clearQuery = () => {
    setActiveQuery({ query: "", name: "" });
  };

  const addOrUpdateLocalQuery = () => {
    const existing = savedQueries
      .concat(localQueries)
      .findIndex((q) => q.name.trim() === activeQuery.name.trim());

    if (existing < 0) {
      setLocalQueries((qrs) =>
        qrs.concat({
          name: activeQuery.name,
          query: activeQuery.query,
        })
      );
    }
  };

  const showList = () => {
    return (
      (localQueries && localQueries.length > 0) ||
      (savedQueries && savedQueries.length > 0)
    );
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
            <NoFocusButton onClick={logout}>Logout</NoFocusButton>
          ) : (
            <AuthModal />
          )}
        </Jumbotron>
        <Row>
          {showList() && (
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
                  autoComplete="off"
                  type="text"
                  name="name"
                  placeholder="Query Name"
                  value={activeQuery.name}
                  onChange={onActiveQueryChange}
                />
                <InputGroup.Append>
                  <NoFocusButton
                    disabled={
                      !activeQuery.name.length || !activeQuery.query.length
                    }
                    onClick={addOrUpdateLocalQuery}
                  >
                    +
                  </NoFocusButton>
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
                <NoFocusButton
                  disabled={!activeQuery.query.length}
                  onClick={executeQuery}
                >
                  Execute Query
                </NoFocusButton>
                <NoFocusButton variant="warning" onClick={clearQuery}>
                  Clear
                </NoFocusButton>
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
            {networkError && (
              <Form.Group>
                <Alert
                  dismissible
                  onClose={() => setNetworkError(null)}
                  variant="danger"
                >
                  <span>{`${networkError}`}</span>
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
