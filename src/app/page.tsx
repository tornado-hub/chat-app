import Link from 'next/link';
import { Container, Row, Col, Button } from 'react-bootstrap';

export default function Home() {
  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={6} className="text-center">
          <h1 className="mb-4">Welcome to the Chat Application</h1>
          <Link href="/login" passHref>
            <Button variant="primary" className="me-2">Login</Button>
          </Link>
          <Link href="/register" passHref>
            <Button variant="secondary">Register</Button>
          </Link>
        </Col>
      </Row>
    </Container>
  );
}
