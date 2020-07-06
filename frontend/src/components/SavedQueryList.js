import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";
import React from "react";

const SavedQueryList = ({ savedQueries, onClick }) => {
  return (
    <Col>
      <Accordion defaultActiveKey="0">
        <Card>
          <Card.Header>
            <Row>
              <Col>
                <Accordion.Toggle as={Card.Header} eventKey="0">
                  {`Queries (${savedQueries.length || 0})`}
                </Accordion.Toggle>
              </Col>
            </Row>
          </Card.Header>

          <Accordion.Collapse eventKey="0">
            <Card.Body>
              <ListGroup variant="flush">
                {savedQueries.map(({ name, _id }, idx) => (
                  <ListGroup.Item
                    variant={_id ? "secondary" : "success"}
                    value={idx}
                    action
                    onClick={onClick}
                    key={`saved-q-${idx}`}
                  >
                    {name}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    </Col>
  );
};

export default SavedQueryList;
