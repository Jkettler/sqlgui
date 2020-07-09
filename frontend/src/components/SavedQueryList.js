import React, { useEffect, useState } from "react";
import {
  Spinner,
  Accordion,
  Card,
  Row,
  Col,
  Navbar,
  ListGroup,
  InputGroup,
  Form,
} from "react-bootstrap";

import NoFocusButton from "./NoFocusButton";
import queryService from "../util/queryService";
import { useJwt } from "../contexts/JwtContext";
import { useUser } from "../contexts/UserContext";

const SavedQueryList = ({
  localQueries,
  setLocalQueries,
  savedQueries,
  setSavedQueries,
  setActiveQuery,
}) => {
  const [deleteMode, setDeleteMode] = useState(false);
  const [willDelete, setWillDelete] = useState([]);
  const [combinedQueries, setCombinedQueries] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const { jwt } = useJwt();
  const { user } = useUser();

  useEffect(() => {
    setCombinedQueries(savedQueries.concat(localQueries));
  }, [localQueries, savedQueries, willDelete.length]);

  const syncList = (e) => {
    e.stopPropagation();
    setSyncing(true);

    queryService.query
      .sync(localQueries, jwt.jwToken)
      .then((res) => {
        setSavedQueries(res.data.queries);
      })
      .catch((e) => console.log(`Sync error ${e}`))
      .then(() => {
        setLocalQueries([]);
        setSyncing(false);
      });
  };

  const deleteSelected = (e) => {
    e.stopPropagation();

    let savedToDelete = [];
    let localToDelete = [];

    willDelete.forEach((index) => {
      const { _id } = combinedQueries[index];

      if (_id) savedToDelete.push(_id);
      else localToDelete.push(index);
    });

    if (localToDelete.length) {
      setLocalQueries((prev) =>
        prev.filter((_, index) => localToDelete.includes(index))
      );
    }

    if (savedToDelete.length) {
      queryService.query
        .delete(savedToDelete, jwt.jwToken)
        .then((res) => {
          setSavedQueries(res.data.queries);
        })
        .catch(() => console.log("save error"))
        .then(() => {
          setWillDelete([]);
          setDeleteMode(false);
        });
    }
  };

  const handleQuerySelection = (e) => {
    setActiveQuery(combinedQueries[e.target.value]);
  };

  const markForDelete = (e) => {
    const {
      target: { value: index },
    } = e;

    if (willDelete.includes(index)) {
      setWillDelete((prev) => prev.filter((val) => val !== index));
    } else {
      setWillDelete((prev) => prev.concat(index));
    }
  };

  const toggleDelete = (e) => {
    e.stopPropagation();
    setDeleteMode(!deleteMode);
  };

  const getItemVariant = (id, index) => {
    if (willDelete.includes(`${index}`)) return "danger";
    if (id) return "success";
    return "secondary";
  };

  const deleteVariant = deleteMode ? "danger" : "outline-danger";

  return (
    <Col>
      <Accordion defaultActiveKey="0">
        <Card>
          <Accordion.Toggle as={Card.Header} eventKey="0">
            <Row>
              <Navbar className={"justify-content-end"}>
                <Navbar.Text>
                  {`Known Queries (${combinedQueries.length || 0})`}
                </Navbar.Text>
              </Navbar>
              {user && (
                <Navbar className={"flex-grow-1 justify-content-end"}>
                  <Form inline>
                    <InputGroup>
                      <NoFocusButton onClick={syncList}>
                        {syncing ? (
                          <Spinner
                            as="span"
                            animation="grow"
                            variant="primary"
                            size="sm"
                          />
                        ) : (
                          <span>Save All</span>
                        )}
                      </NoFocusButton>
                      <NoFocusButton
                        onClick={
                          willDelete.length && deleteMode
                            ? deleteSelected
                            : toggleDelete
                        }
                        variant={deleteVariant}
                      >
                        {willDelete.length
                          ? `Delete ${willDelete.length}`
                          : "X"}
                      </NoFocusButton>
                    </InputGroup>
                  </Form>
                </Navbar>
              )}
            </Row>
          </Accordion.Toggle>

          <Accordion.Collapse eventKey="0" appear={true}>
            <div>
              <ListGroup variant="flush">
                <Card.Body>
                  {combinedQueries.map(({ query, name, _id }, idx) => (
                    <ListGroup.Item
                      variant={getItemVariant(_id, idx)}
                      value={idx}
                      action
                      onClick={
                        deleteMode ? markForDelete : handleQuerySelection
                      }
                      key={`${getItemVariant(_id, idx)}${idx}`}
                    >
                      {name}
                    </ListGroup.Item>
                  ))}
                </Card.Body>
              </ListGroup>
            </div>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    </Col>
  );
};

export default SavedQueryList;
