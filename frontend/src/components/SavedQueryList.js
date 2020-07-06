import React, { useState } from "react";
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import Nav from "react-bootstrap/Nav";

const SavedQueryList = ({
  setActiveQuery,
  localQueries,
  setLocalQueries,
  savedQueries,
  setSavedQueries,
}) => {
  const syncUrl = "http://localhost:9000/api/user_queries/sync";

  const syncList = (e) => {
    e.stopPropagation();
    return axios.post(syncUrl, localQueries).then((res) => {
      setSavedQueries(res.data.queries);
      setLocalQueries([]);
    });
  };

  const handleListSelection = (e) => {
    setActiveQuery(combinedQueries[e.target.value]);
  };

  const combinedQueries = savedQueries.concat(localQueries);

  return (
    <Col>
      <Accordion defaultActiveKey="0">
        <Card>
          <Row>
            <Col>
              <Accordion.Toggle as={Card.Header} eventKey="0">
                <Nav fill as="ul">
                  <Nav.Item as="li">
                    {`Queries (${combinedQueries.length || 0})`}
                  </Nav.Item>
                  <Nav.Item as="li">
                    <Button onClick={syncList}>Save All</Button>
                  </Nav.Item>
                </Nav>
              </Accordion.Toggle>
            </Col>
          </Row>

          <Accordion.Collapse eventKey="0" appear={true}>
            <div>
              <ListGroup variant="flush">
                <Card.Body>
                  {combinedQueries.map(({ query, name, _id }, idx) => (
                    <ListGroup.Item
                      variant={_id ? "success" : "secondary"}
                      value={idx}
                      action
                      onClick={handleListSelection}
                      key={`saved-q-${idx}`}
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
